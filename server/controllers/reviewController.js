import { Review } from "../models/reviewModel.js";
import { Product } from "../models/productModel.js"; 
import { Order } from "../models/OrderModel.js";


export const createReview = async (req, res) => {
    try {
        const { rating, comment, product: productId } = req.body;
        const userId = req.user.id;

        const hasPurchased = await Order.findOne({
            user: userId,
            "orderItems.product": productId,
            orderStatus: "Delivered"
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: "You can only review products you have purchased and received."
            });
        }

        const existingReview = await Review.findOne({ user: userId, product: productId });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product."
            });
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment,
        });

        const allReviews = await Review.find({ product: productId });
        const numOfReviews = allReviews.length;
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

        await Product.findByIdAndUpdate(productId, {
            rating: avgRating.toFixed(1), 
            numOfReviews: numOfReviews,
            $push: { reviews: review._id }
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully!",
            review,
        });

    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};
