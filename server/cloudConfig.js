import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

// ✅ Load .env file
dotenv.config();

// ✅ Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage setup for multiple file types
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // ✅ Different folders for different file types
    let folder = "Ecommerce";
    
    if (file.fieldname === 'banner') {
      folder = "Ecommerce/banners";
    } else if (file.fieldname === 'images') {
      folder = "Ecommerce/products";
    }

    return {
      folder,
      allowed_formats: ["png", "jpg", "jpeg", "webp"],
      // ✅ Optional: Add transformation for banner images
      transformation: file.fieldname === 'banner' ? [
        { width: 1200, height: 400, crop: "fill" }
      ] : []
    };
  },
});

export { cloudinary, storage };