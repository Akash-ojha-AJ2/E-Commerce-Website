import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: {
        type: String,
        minLength: [8, "Password must have at least 8 characters."],
        select: false,
    },
    phone: String,
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    profile: { type: String, default: "" },
    sex: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other",
    },
    address: { type: String, default: "" },

    isSeller: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },

    role: {
        type: String,
        enum: ["user", "seller", "admin"],
        default: "user",
    },

    sellerInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        default: null,
    },

    // ✅ NEW FIELD: Orders ka reference
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order', // Order model se link
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, 0);

    return parseInt(firstDigit + remainingDigits);
  }
  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);