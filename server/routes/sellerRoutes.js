import express from "express";
import { getSellerOrders, updateOrderStatus , getSellerStats } from "../controllers/sellerOrderController.js";
import {getSellerPaymentHistory , getSellerEarningsByPeriod , getSellerProfitSummary} from "../controllers/SellerController.js"
import { isAuthenticated } from "../middlewares/auth.js";
import { isSeller } from '../middlewares/isSeller.js';
import wrapAsync from "../middlewares/wrapAsync.js"

const router = express.Router();

// Seller ke orders fetch
router.get("/myorders",isAuthenticated, isSeller, wrapAsync(getSellerOrders));

// Seller order status update
router.put("/status/:orderId" ,isAuthenticated, isSeller, wrapAsync(updateOrderStatus));
router.get("/getSellerStats" , isAuthenticated , isSeller , wrapAsync(getSellerStats))

router.get('/profit/summary', isAuthenticated, isSeller, wrapAsync(getSellerProfitSummary));
router.get('/profit/period', isAuthenticated, isSeller, wrapAsync(getSellerEarningsByPeriod));
router.get('/profit/payment-history', isAuthenticated, isSeller, wrapAsync(getSellerPaymentHistory));

export default router;
