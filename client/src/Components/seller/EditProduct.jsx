import React, { useEffect, useState , useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SellerLayout from './SellerLayout';
import { Context } from "../../store/Context";

const EditProduct = () => {
  const productTypes = ["Grocery", "Smartphone", "Fashion", "Electronics", "Home & Furniture", "Appliances", "Headphone", "Furniture" ,"Beauty & Toys", "Watches", "Sports_Fitness", "Beauty_Personal_Care",  "Other"];
  const { id } = useParams();
  const { backend } = useContext(Context);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    type: "",
    description: "",
    specifications: []
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [banner, setBanner] = useState(null);
  const [existingBanner, setExistingBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${backend}/api/v1/seller/product/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setForm({
            name: data.product.name,
            price: data.product.price,
            stock: data.product.stock,
            category: data.product.category,
            description: data.product.description,
            type: data.product.type,
            specifications: data.product.specifications || []
          });
          setExistingImages(data.product.images || []);
          setExistingBanner(data.product.banner || null);
        } else {
          toast.error("Product not found");
        }
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...form.specifications];
    updated[index][field] = value;
    setForm({ ...form, specifications: updated });
  };

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handleBannerUpload = (e) => {
    setBanner(e.target.files[0]);
  };

  const removeSpec = (index) => {
    const updated = form.specifications.filter((_, i) => i !== index);
    setForm({ ...form, specifications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);
    formData.append("type", form.type);
    formData.append("description", form.description);
    formData.append("specifications", JSON.stringify(form.specifications));
    
    // Append new images
    images.forEach(img => formData.append("images", img));
    
    // Append banner if selected
    if (banner) {
      formData.append("banner", banner);
    }

    try {
      const res = await fetch(`${backend}/api/v1/seller/update-product/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product updated successfully!");
        navigate("/seller/my-products");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
     <SellerLayout>
    <div className="container py-5">
      <h2 className="mb-4 text-center text-warning">✏️ Edit Product</h2>
      <form onSubmit={handleSubmit} className="row g-4">

        <div className="col-md-6">
          <label className="form-label">Product Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-3">
          <label className="form-label">Price</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-3">
          <label className="form-label">Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Category</label>
          <input type="text" name="category" value={form.category} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Product Type</label>
          <select name="type" value={form.type} onChange={handleChange} required className="form-select">
            <option value="">-- Select Type --</option>
            {productTypes.map((type) => (
              <option key={type} value={type.toLowerCase().replace(/ & /g, '_')}>{type}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows="3" required />
        </div>

        {/* Specifications */}
        <div className="col-12">
          <label className="form-label">Specifications</label>
          {form.specifications.map((spec, index) => (
            <div className="row g-2 mb-2" key={index}>
              <div className="col">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  className="form-control"
                  placeholder={`Key (e.g., Brand)`}
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  className="form-control"
                  placeholder={`Value (e.g., Nike)`}
                />
              </div>
              <div className="col-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeSpec(index)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-secondary mt-2"
            onClick={() => setForm(prev => ({
              ...prev,
              specifications: [...prev.specifications, { key: "", value: "" }]
            }))}
          >
            ➕ Add Specification
          </button>
        </div>

        {/* Existing Banner Preview */}
        {existingBanner && (
          <div className="col-12">
            <label className="form-label">Existing Banner</label>
            <div className="d-flex flex-wrap gap-2">
              <img 
                src={existingBanner.url} 
                alt="Product Banner" 
                width="300" 
                height="150" 
                style={{ objectFit: 'cover', border: '2px solid #ffc107' }} 
                className="rounded"
              />
            </div>
          </div>
        )}

        {/* Upload New Banner */}
        <div className="col-12">
          <label className="form-label">
            {existingBanner ? 'Replace Banner' : 'Upload Banner'} (optional)
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleBannerUpload} 
            className="form-control" 
          />
          <div className="form-text">
            Recommended size: 1200x400px for best display
          </div>
        </div>

        {/* Existing Images Preview */}
        {existingImages.length > 0 && (
          <div className="col-12">
            <label className="form-label">Existing Images</label>
            <div className="d-flex flex-wrap gap-2">
              {existingImages.map((img, i) => (
                <img 
                  key={i} 
                  src={img.url} 
                  alt="Product" 
                  width="120" 
                  height="120" 
                  style={{ objectFit: 'cover' }} 
                  className="rounded"
                />
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <div className="col-12">
          <label className="form-label">
            {existingImages.length > 0 ? 'Replace Images' : 'Upload Images'} (optional)
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="form-control" 
          />
          <div className="form-text">
            Selecting new images will replace all existing images
          </div>
        </div>

        <div className="col-12 d-grid mt-3">
          <button 
            type="submit" 
            className="btn btn-warning btn-lg" 
            disabled={loading}
          >
            {loading ? (
              <div style={{display: 'inline-flex', alignItems: 'center'}}>
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #fff',
                    borderRight: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginRight: '8px'
                  }}
                ></div>
                Updating...
              </div>
            ) : (
              'Update Product'
            )}
          </button>
        </div>
      </form>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
    </SellerLayout>
  );
};

export default EditProduct;