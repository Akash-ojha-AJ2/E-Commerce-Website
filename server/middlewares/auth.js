import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import ErrorHandler from "./error.js";

export const isAuthenticated = async (req, res, next) => {

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// ✅ Admin-only middleware
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ErrorHandler("Admin access only", 403));
  }
  next();
};
