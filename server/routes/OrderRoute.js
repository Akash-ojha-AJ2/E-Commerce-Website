import express from "express";
import { placeOrder,getUserOrders,createOrderFromCart } from "../controllers/OrderController.js";
import { isAuthenticated} from '../middlewares/auth.js';
import wrapAsync from "../middlewares/wrapAsync.js"

const router = express.Router();

router.post("/new", isAuthenticated, wrapAsync(placeOrder));
router.get("/user/:id", isAuthenticated,wrapAsync(getUserOrders));

router.post('/order/new-from-cart', isAuthenticated, wrapAsync(createOrderFromCart));
router.route('/order/cart/new').post(isAuthenticated, wrapAsync(createOrderFromCart));



// router.get("/user/:id", isAuthenticated,getUserOrders);

export default router;
