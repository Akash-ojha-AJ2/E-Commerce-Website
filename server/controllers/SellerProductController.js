import { Product } from '../models/productModel.js';
import { v2 as cloudinary } from 'cloudinary';
import qs from "qs"; 

export const uploadProduct = async (req, res) => {
  try {
    const parsedBody = qs.parse(req.body);
    const { name, description, price, stock, category, type, specifications } = parsedBody;

    const cleanSpecifications = Array.isArray(specifications)
      ? specifications.filter(spec => spec.key?.trim() && spec.value?.trim())
      : [];

    const images = req.files?.images?.map(file => ({
      url: file.path,
      public_id: file.filename,
    })) || [];

    const banner = req.files?.banner?.[0] ? {
      url: req.files.banner[0].path,
      public_id: req.files.banner[0].filename,
    } : null;

    const product = await Product.create({
      seller: req.user.sellerInfo,
      name,
      description,
      price,
      stock,
      category,
      type,
      specifications: cleanSpecifications,
      images,
      banner, 
    });

    return res.status(201).json({
      success: true,
      message: "Product uploaded successfully!",
      product,
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload product",
      error: error.message,
    });
  }
};


export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.sellerInfo })
      .populate({
        path: 'reviews',
        select: 'rating' 
      })
      .lean();

    const productsWithRatings = products.map(product => {
      let reviewCount = 0;
      let avgRating = 0;

      if (product.reviews && Array.isArray(product.reviews)) {
        reviewCount = product.reviews.length;
        if (reviewCount > 0) {
          const totalRating = product.reviews.reduce((sum, review) => {
            return sum + (review.rating || 0);
          }, 0);
          avgRating = Number((totalRating / reviewCount).toFixed(1));
        }
      }

      const { reviews, ...productWithoutReviews } = product;
      
      return {
        ...productWithoutReviews,
        reviewCount,
        avgRating
      };
    });
    
    
    res.status(200).json({ 
      success: true, 
      products: productsWithRatings 
    });
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching products' 
    });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.sellerInfo,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const updateMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.sellerInfo });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, stock, category, type } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (type) product.type = type;

    if (req.body.specifications) {
      try {
        const specs = JSON.parse(req.body.specifications);
        product.specifications = specs.filter(spec => spec.key?.trim() && spec.value?.trim());
      } catch (error) {
        console.error("Error parsing specifications:", error);
        product.specifications = [];
      }
    }

    if (req.files?.banner && req.files.banner[0]) {
      if (product.banner && product.banner.public_id) {
        try {
          await cloudinary.uploader.destroy(product.banner.public_id);
        } catch (error) {
          console.error("Error deleting old banner:", error);
        }
      }

      // Upload new banner
      const bannerFile = req.files.banner[0];
      product.banner = {
        url: bannerFile.path,
        public_id: bannerFile.filename,
      };
    }

    if (req.files?.images && req.files.images.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        try {
          for (const img of product.images) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        } catch (error) {
          console.error("Error deleting old images:", error);
        }
      }

      // Upload new images
      const newImages = req.files.images.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
      product.images = newImages;
    }

    await product.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Product updated successfully', 
      product 
    });

  } catch (err) {
    console.error("❌ Update Product Error:", err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update product',
      error: err.message 
    });
  }
};


export const deleteMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.sellerInfo});

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    for (let img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const getProductsByCategory = async (req, res) => {
  try {
    const { cat } = req.params;

    const products = await Product.find({ category: cat })
      .populate('seller', 'name') // optional, include seller info
      .select('name price images category specifications') // only send necessary fields
      .limit(12);

    res.json(products);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};



