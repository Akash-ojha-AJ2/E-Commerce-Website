import express from 'express';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyPayment,
  createSingleOrder,
  createCODOrder,
  getUserOrders,
  getOrderDetails
} from '../controllers/singleProductOrderController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js"

const router = express.Router();

// Payment routes
router.get('/payment/key', isAuthenticated, wrapAsync(getRazorpayKey));
router.post('/payment/create', isAuthenticated, wrapAsync(createRazorpayOrder));
router.post('/payment/verify', isAuthenticated, wrapAsync(verifyPayment));

// Order routes
router.post('/order/singleOrder', isAuthenticated, wrapAsync(createSingleOrder));
router.post('/order/new-from-cart', isAuthenticated, wrapAsync(createCODOrder));
router.get('/orders', isAuthenticated, wrapAsync(getUserOrders));
router.get('/order/:id', isAuthenticated, wrapAsync(getOrderDetails));

export default router;