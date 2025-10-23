import express from "express";
import multer from "multer";
import { storage } from "../cloudConfig.js"; 
const upload = multer({ storage });
import {

  register,
  verifyOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  updateUser,
  becomeSeller

} from "../controllers/userController.js";

import { isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

router.get("/me",isAuthenticated, getUser,);
router.put('/update', isAuthenticated, upload.single("profile"),updateUser);
router.post("/become-seller", isAuthenticated, upload.fields([
  { name: "panCardImage", maxCount: 1 },
  { name: "aadhaarImage", maxCount: 1 }
]), becomeSeller);
router.post("/register", register);
router.post("/otp-verification", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);



export default router;