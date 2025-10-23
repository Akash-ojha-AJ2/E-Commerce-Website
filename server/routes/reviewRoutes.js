import express from "express";
import { createReview } from "../controllers/reviewController.js";
import { isAuthenticated } from "../middlewares/auth.js"; // अपना 'isAuth' मिडलवेयर इम्पोर्ट करें

const router = express.Router();

// POST /api/review/create
router.post("/create",  isAuthenticated, createReview);

export default router;