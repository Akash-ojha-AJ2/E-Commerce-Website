import express from 'express';
import multer from "multer";
import { uploadProduct,getProductById,deleteMyProduct, updateMyProduct, getSellerProducts, getProductsByCategory} from '../controllers/SellerProductController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { storage } from "../cloudConfig.js"; // ✅ Correct import
const upload = multer({ storage }); // ✅ Correct import
import { isSeller } from '../middlewares/isSeller.js';
import wrapAsync from "../middlewares/wrapAsync.js"


const router = express.Router();

router.post(
  '/sellproducts',
  isAuthenticated,
  isSeller,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'banner', maxCount: 1 }
  ]),
  wrapAsync(uploadProduct)
);

router.get('/my-products', isAuthenticated, isSeller, wrapAsync(getSellerProducts));

router.get('/product/:id', isAuthenticated, isSeller, wrapAsync(getProductById));

// Delete a specific product created by the seller
router.delete('/delete-product/:id', isAuthenticated, isSeller, wrapAsync(deleteMyProduct));

router.put(
  '/update-product/:id',
  isAuthenticated,
  isSeller,
    upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'banner', maxCount: 1 }
  ]),
  wrapAsync(updateMyProduct)
);


router.get('/category/:cat', wrapAsync(getProductsByCategory));

export default router;
