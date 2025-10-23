import express from 'express'
const router = express.Router();
import  {getHomeProducts,getProductById,addToCart, getCart, removeFromCart , getProductsByCategory,updateCartQuantity,getCartCount,getProductsWithBanners}  from '../controllers/userProductController.js';
import { createOrderFromCart,getRazorpayKey,createRazorpayOrder,verifyPayment } from '../controllers/OrderController.js';

import { isAuthenticated } from '../middlewares/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js"

router.get('/products', wrapAsync(getHomeProducts));
router.get('/product/bannner' , wrapAsync(getProductsWithBanners))
router.get('/productsdeatil/:id', wrapAsync(getProductById));
router.post('/products/add-card', isAuthenticated, wrapAsync(addToCart)); 
router.get('/cart-count', isAuthenticated, wrapAsync(getCartCount));
router.delete('/cart/remove', isAuthenticated, wrapAsync(removeFromCart)); 
router.put('/cart/update', isAuthenticated, wrapAsync(updateCartQuantity));

router.get('/cart', isAuthenticated,  wrapAsync(getCart));
router.get('/productsName/:category' ,  wrapAsync(getProductsByCategory));



// Order routes
router.post('/order/new-from-cart', isAuthenticated, wrapAsync(createOrderFromCart));



// Payment routes
router.get('/payment/key', isAuthenticated, wrapAsync(getRazorpayKey));
router.post('/payment/create', isAuthenticated, wrapAsync(createRazorpayOrder));
router.post('/payment/verify', isAuthenticated, wrapAsync(verifyPayment));

export default router;

