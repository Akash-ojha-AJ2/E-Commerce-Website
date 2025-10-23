// index.js (CommonJS style)
import { config } from "dotenv";
config({ path: "./config.env" });
import express from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import Connection from "./database/dbconnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRoutes.js";
import notificationRoutes from './routes/notificationRoutes.js';
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import SellerProductRoutes from "./routes/SellerProductRoutes.js"
import userProductRoutes from "./routes/userProducRouter.js"
import AiSearchRoutes from "./routes/AiSearchRoutes.js"
import orderRoute from './routes/OrderRoute.js'
import sellerRoutes from "./routes/sellerRoutes.js"
import reviewRouter from "./routes/reviewRoutes.js"
import singleOrder from "./routes/singleProductOrderRoutes.js"
import AiRoutes from "./routes/AiRoutes.js"

export const app = express();


app.use(express.json());

app.use(cookieParser());

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173", // local frontend (Vite default)
  "https://e-commerce-website-omega-black.vercel.app", // deployed frontend
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // allow cookies
  })
);



app.use((req, res, next) => {
  next();
});




app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/user", userRouter);
app.use("/api/ai-search", AiSearchRoutes);

app.use("/api/admin", adminRouter);

app.use('/api/v1/notifications', notificationRoutes);
app.use("/api/v1/seller", SellerProductRoutes);

app.use("/api/v1/userproduct", userProductRoutes);
app.use("/api/v1/singleOrder", singleOrder);

app.use('/api/order', orderRoute);
// app.use("/api/payment", paymentRoutes);
app.use('/api/seller', sellerRoutes);
app.use("/api/review", reviewRouter);

app.use('/api/ai', AiRoutes);

removeUnverifiedAccounts();
Connection();

app.use(errorMiddleware);



