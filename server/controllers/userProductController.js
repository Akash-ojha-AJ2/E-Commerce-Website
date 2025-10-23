// controllers/productController.js
import {Product}  from '../models/productModel.js'
import {Cart} from '../models/cardModel.js';
import { Review } from '../models/reviewModel.js';
import { ExpressError } from '../middlewares/ExpressError.js';
import mongoose from 'mongoose';



export const getHomeProducts = async (req, res) => { 
  try {
    const categories = ['smartphone', 'tablet', 'laptop', 'smartwatch',  "earbuds",  "gym_essentials" , "kurta" , "washing_machine"];

    const results = await Promise.all(
      categories.map(cat =>
        Product.aggregate([

          { $match: { category: cat } },

          { $limit: 6 },

          {
            $lookup: {
              from: 'reviews', 
              localField: '_id', 
              foreignField: 'product', 
              as: 'reviewDetails' 
            }
          },

          {
            $addFields: {
              reviewCount: { $size: '$reviewDetails' },
              avgRating: { $ifNull: [{ $avg: '$reviewDetails.rating' }, 0] }
            }
          },

          {
            $project: {
              reviewDetails: 0, 
              reviews: 0 
            }
          }
        ])
      )
    );

    const response = {};
    categories.forEach((cat, index) => {
      response[cat] = results[index];
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching home products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const getProductById = async (req, res) => {
 try {
  const product = await Product.findById(req.params.id)
   .populate({
    path: 'reviews', 
    populate: {
     path: 'user', 
     select: 'name avatar'
    }
   });


  if (!product) {
   return res.status(404).json({ message: 'Product not found' });
  }

  let avgRating = 0;
  const reviewCount = product.reviews.length;

  if (reviewCount > 0) {
   const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
   avgRating = totalRating / reviewCount;
  }

  const productResponse = product.toObject();
  productResponse.reviewCount = reviewCount;
  productResponse.avgRating = avgRating;

  res.json(productResponse);

 } catch (err) {
  res.status(500).json({ message: 'Server Error', error: err.message });
 }
};



export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId, quantity: 1 }],
      });
    } else {
      const productIndex = cart.products.findIndex(p => {
        return p.productId && p.productId.toString() === productId.toString();
      });

      if (productIndex > -1) {
        cart.products[productIndex].quantity += 1;
      } else {
        cart.products.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    return res.status(200).json({ 
      success: true, 
      message: 'Product added to cart', 
      cart 
    });

  } catch (err) {
    console.error('Add to cart failed:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error' 
    });
  }
};




export const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed. Please log in.' 
      });
    }
    
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      model: 'Product',
      select: 'name price images category type specifications stock'
    });

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(200).json({ 
        success: true, 
        cartItems: [],
        message: 'Cart is empty'
      });
    }

    const validCartProducts = cart.products.filter(item => 
      item.productId !== null && item.productId !== undefined
    );

    if (validCartProducts.length === 0) {
      return res.status(200).json({ 
        success: true, 
        cartItems: [],
        message: 'No valid products in cart'
      });
    }

    const cartItems = [];
    
    for (const item of validCartProducts) {
      const product = item.productId;
      
      let avgRating = 0;
      let reviewCount = 0;

      try {
        const reviews = await Review.find({ 
          product: product._id 
        });
        
        reviewCount = reviews.length;
        
        if (reviewCount > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          avgRating = parseFloat((totalRating / reviewCount).toFixed(1));
        }
        
      } catch (err) {
        console.log(`❌ Error fetching reviews for product ${product._id}:`, err.message);
      }

      const totalPrice = product.price * item.quantity;

      cartItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        category: product.category,
        type: product.type,
        specifications: product.specifications || [],
        stock: product.stock,
        quantity: item.quantity,
        totalPrice: totalPrice,
        avgRating: avgRating,
        reviewCount: reviewCount,
        inStock: product.stock > 0
      });
    }

    const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return res.status(200).json({ 
      success: true, 
      cartItems,
      cartSummary: {
        totalItems,
        cartTotal: parseFloat(cartTotal.toFixed(2)),
        discount: 0,
        deliveryCharge: 0,
        finalAmount: parseFloat(cartTotal.toFixed(2))
      }
    });

  } catch (err) {
    console.error('❌ Error in getCart:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: err.message 
    });
  }
};



export const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id; 
    
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        cartCount: 0
      });
    }

    const cartCount = cart.products.reduce((total, item) => total + item.quantity, 0);

    res.status(200).json({
      success: true,
      cartCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart count',
      error: error.message
    });
  }
};



// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true }
    ).populate({
      path: 'products.productId',
      model: 'Product',
      select: 'name price images'
    });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Product removed from cart', 
      cart 
    });
  } catch (err) {
    console.error('Remove from cart failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: err.message 
    });
  }
};




export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID or quantity' 
      });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    const productIndex = cart.products.findIndex(
      p => p.productId && p.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in cart' 
      });
    }

    // Update quantity
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    // Return updated cart
    await cart.populate({
      path: 'products.productId',
      model: 'Product',
      select: 'name price images category type specifications stock'
    });

    res.json({
      success: true,
      message: 'Quantity updated successfully',
      cart
    });

  } catch (err) {
    console.error('Update cart quantity failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: err.message 
    });
  }
};






export const getProductsByCategory = async (req, res, next) => {
    
    try {
        const { category } = req.params;

        if (!category) {
            return next(new ExpressError('Category name is required', 400));
        }

        const products = await Product.find({
            type: { $regex: `^${category}$`, $options: 'i' }
        }).populate('reviews'); 

        const productsWithAvgRating = products.map(product => {
            let avgRating = 0;
            if (product.reviews && product.reviews.length > 0) {
                const sumOfRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
                const average = sumOfRatings / product.reviews.length;
                avgRating = parseFloat(average.toFixed(1));
            }

            const productObject = product.toObject();
            productObject.avgRating = avgRating;

            return productObject;
        });

        res.status(200).json({
            success: true,
            count: productsWithAvgRating.length,
            products: productsWithAvgRating, 
        });

    } catch (error) {
        next(error);
    }
};





export const getProductsWithBanners = async (req, res) => {
  try {
    
    const productsWithBanners = await Product.find({
      'banner.url': { $exists: true, $ne: '' } 
    })
    .select('name description price banner images category type specifications avgRating stock')
    .populate('seller', 'name')
    .sort({ createdAt: -1 }) 
    .limit(12); 

    res.status(200).json({
      success: true,
      message: "Products with banners loaded successfully",
      count: productsWithBanners.length,
      products: productsWithBanners
    });

  } catch (error) {
    console.error("❌ Get Products With Banners Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load products with banners",
      error: error.message
    });
  }
};
