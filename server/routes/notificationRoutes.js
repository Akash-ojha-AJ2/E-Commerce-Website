// 📁 routes/notificationRoutes.js
import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import {getUserNotifications, markAllNotificationsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get("/notifications", isAuthenticated, getUserNotifications);
router.patch('/mark-read', isAuthenticated, markAllNotificationsRead);

export default router;
