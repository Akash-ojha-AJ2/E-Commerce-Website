import express from 'express';
import { handleSellerApproval, getSellerRequests ,getAdminDashboardStats,getAllPendingPayments,processAdminToSellerPayment,
    getSellerOrders,getAllSellers,getAdminRevenueStats, getRevenueByTimePeriod,exportRevenueReport
} from '../controllers/adminController.js';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js";

const router = express.Router();

// Fetch all pending seller requests
router.get("/seller-requests", isAuthenticated, isAdmin, wrapAsync(getSellerRequests));
router.get('/admin-dashboard-stats', isAuthenticated, isAdmin, wrapAsync(getAdminDashboardStats));
router.get("/sellers/all-sellers" , isAuthenticated , isAdmin , wrapAsync(getAllSellers))
router.get("/sellerInfo/sellerOrders/:sellerId", isAuthenticated, isAdmin, wrapAsync(getSellerOrders));
router.get('/payments/all-pending-payments', isAuthenticated, isAdmin, wrapAsync(getAllPendingPayments));
router.post('/payments/process-payment-to-seller', isAuthenticated, isAdmin, wrapAsync(processAdminToSellerPayment));
// Handle approve/reject
router.patch("/seller-requests/:userId/:action", isAuthenticated, isAdmin, wrapAsync(handleSellerApproval));
router.get('/revenue/stats', isAuthenticated, isAdmin, wrapAsync(getAdminRevenueStats));
router.get('/revenue/period', isAuthenticated, isAdmin, wrapAsync(getRevenueByTimePeriod));
router.get('/revenue/export', isAuthenticated, isAdmin, wrapAsync(exportRevenueReport));

export default router;
