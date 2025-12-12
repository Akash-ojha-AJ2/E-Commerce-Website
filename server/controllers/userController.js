import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { config } from "dotenv";
config({ path: "./config.env" });
import { Notification } from "../models/notificationModel.js";
import { Seller } from "../models/SellerModel.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


export const register = catchAsyncError(async (req, res, next) => {
  try {
    console.log(req.body);
    const { name, email, phone, password, verificationMethod } = req.body;
    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler("All fields are required.", 400));
    }
    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91[6789]\d{9}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number.", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or Email is already used.", 400));
    }

    const registerationAttemptsByUser = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registerationAttemptsByUser.length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      phone,
      password,
    };

    const user = await User.create(userData);
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(
      verificationMethod,
      verificationCode,
      name,
      email,
      phone,
      res
    );
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res
) {
  try {
    // === EMAIL ===
    if (verificationMethod === "email") {
      const html = generateEmailTemplate(verificationCode, name);
      await sendEmail({
        email,
        subject: "ShopKart - Verify Your Email",
        html,
      });
      return res.status(200).json({
        success: true,
        message: `Verification email sent to ${email}`,
      });
    }

    // === PHONE / SMS ===
    if (verificationMethod === "phone") {
      // Prefer Twilio Verify if configured (more reliable and recommended)
      if (process.env.TWILIO_VERIFY_SERVICE_SID) {
        try {
          await client.verify
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({ to: phone, channel: "sms" });

          return res.status(200).json({
            success: true,
            message: `OTP sent to ${phone} via Twilio Verify.`,
          });
        } catch (verifyErr) {
          console.warn("Twilio Verify failed:", verifyErr?.message || verifyErr);
          // Fall through to try SMS via messages.create as a fallback
        }
      }

      // Fallback: send SMS using messaging (requires TWILIO_PHONE_NUMBER)
      if (!process.env.TWILIO_PHONE_NUMBER) {
        return res.status(500).json({
          success: false,
          message:
            "Server not configured to send SMS. Set TWILIO_VERIFY_SERVICE_SID or TWILIO_PHONE_NUMBER in environment.",
        });
      }

      try {
        const sms = await client.messages.create({
          body: `Your ShopKart verification code is ${verificationCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });

        return res.status(200).json({
          success: true,
          message: `OTP sent via SMS to ${phone}.`,
          sid: sms.sid,
        });
      } catch (smsErr) {
        console.error("Twilio messages.create error:", smsErr);

        if (smsErr?.code === 21210) {
          return res.status(400).json({
            success: false,
            message:
              "Twilio 'from' number not verified or not purchased for your account (21210). Purchase a Twilio number or verify caller ID.",
            details: smsErr.message,
          });
        }
        if (smsErr?.code === 21614) {
          return res.status(400).json({
            success: false,
            message:
              "Destination phone number cannot receive SMS (21614). Check number format and carrier support.",
            details: smsErr.message,
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to send OTP via SMS.",
          error: smsErr?.message || smsErr,
        });
      }
    }

    // Unknown method
    return res.status(400).json({ success: false, message: "Invalid verification method." });
  } catch (err) {
    console.error("sendVerificationCode unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
      error: err?.message || "Unknown error",
    });
  }
}




function generateEmailTemplate(verificationCode, userName = "") {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>ShopKart Email Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px; background:#ffffff; border-radius:10px; box-shadow:0 3px 8px rgba(0,0,0,0.05); overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(90deg,#0d6efd,#6f42c1); padding:20px; text-align:center; color:#fff;">
                <h1 style="margin:0; font-size:22px;">ShopKart</h1>
                <p style="margin:5px 0 0; font-size:14px;">Your trusted online store</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 32px;">
                <p style="font-size:16px; color:#333;">Hello ${userName || "ShopKart User"},</p>
                <p style="font-size:15px; color:#444;">Thank you for signing up at <strong>ShopKart</strong>! Please use the verification code below to confirm your email address.</p>

                <div style="text-align:center; margin:24px 0;">
                  <div style="display:inline-block; padding:16px 28px; border:2px dashed #0d6efd; border-radius:10px; background:#f8fafc;">
                    <span style="font-size:28px; font-weight:700; color:#0d6efd; letter-spacing:4px;">${verificationCode}</span>
                  </div>
                  <p style="margin-top:10px; font-size:13px; color:#6b7280;">This code will expire in 10 minutes</p>
                </div>

                <p style="font-size:14px; color:#444;">If you didn’t request this verification, you can safely ignore this email.</p>

                <p style="font-size:14px; color:#333; margin-top:24px;">Cheers,<br><strong>The ShopKart Team</strong></p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb; text-align:center; padding:16px; font-size:12px; color:#888;">
                <p style="margin:0;">© ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
                <p style="margin:4px 0 0;">This is an automated email — please do not reply.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}


export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  function validatePhoneNumber(phone) {
    const phoneRegex = /^\+91[6789]\d{9}$/;
    return phoneRegex.test(phone);
  }

  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  try {
    const userAllEntries = await User.find({
      $or: [
        {
          email,
          accountVerified: false,
        },
        {
          phone,
          accountVerified: false,
        },
      ],
    }).sort({ createdAt: -1 });

    if (!userAllEntries) {
      return next(new ErrorHandler("User not found.", 404));
    }

    let user;


    if (userAllEntries.length > 1) {
      user = userAllEntries[0];

      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });
    } else {
      user = userAllEntries[0];

    }

    console.log(user.verificationCode);

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    }

    const currentTime = Date.now();

    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();
    console.log(currentTime);
    console.log(verificationCodeExpire);
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expired.", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});






export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password");


  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }

  sendToken(user, 200, "User logged in successfully.", res);
});


export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("sellerInfo"); // ✅ populate sellerInfo details

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});



export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Generate token & save
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // Generate HTML email
  const html = generateResetPasswordTemplate(user.name || "User", resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "🔐 Reset Your Password | ShopKart",
      html,
    });

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message || "Failed to send reset password email.",
        500
      )
    );
  }
});






function generateResetPasswordTemplate(name, resetLink) {
  return `
  <div style="font-family: 'Poppins', Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #6f42c1; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">ShopKart</h2>
        <p style="margin: 0;">Your trusted shopping companion 🛍️</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px;">
        <h3 style="color: #333;">Hello ${name},</h3>
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Don’t worry — it happens to the best of us!
        </p>

        <p style="font-size: 16px; color: #555;">
          Click the button below to reset your password:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetLink}" 
             style="background-color: #6f42c1; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 15px; color: #777;">
          Or copy and paste this link into your browser:
          <br />
          <a href="${resetLink}" style="color: #6f42c1; word-break: break-all;">${resetLink}</a>
        </p>

        <p style="font-size: 15px; color: #777;">
          This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #888;">
        <p>© ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
        <p>This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
  `;
}


export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully.", res);
});



export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    user.sex = req.body.sex || user.sex;

    if (req.file && req.file.path) {
      user.profile = req.file.path;
    }

    await user.save();

    // Remove sensitive fields before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const becomeSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      businessName,
      gstNumber,
      shopAddress,
      panCardNumber,
      aadhaarNumber,
    } = req.body;

    if (!businessName || !gstNumber || !shopAddress || !panCardNumber || !aadhaarNumber) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existingSeller = await Seller.findOne({ user: user._id });
    if (existingSeller) {
      return res.status(400).json({ success: false, message: "You have already applied to become a seller." });
    }

    const panUpload = req.files?.panCardImage?.[0];
    const aadhaarUpload = req.files?.aadhaarImage?.[0];

    if (!panUpload || !aadhaarUpload) {
      return res.status(400).json({ success: false, message: "Both PAN and Aadhaar images are required." });
    }

    // ✅ Create seller with image URLs and public IDs
    const newSeller = await Seller.create({
      user: user._id,
      businessName,
      gstNumber,
      shopAddress,
      approved: false,
      panCardNumber,
      aadhaarNumber,
      panCardImage: panUpload.path,
      panCardImageId: panUpload.filename, 
      aadhaarImage: aadhaarUpload.path,
      aadhaarImageId: aadhaarUpload.filename,
    });

  
    user.isSeller = false;
    user.sellerInfo = newSeller._id;
    await user.save();

    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      await Notification.create({
        user: admin._id,
        message: `${user.name} has requested to become a seller.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller request submitted successfully.",
      user,
    });

  } catch (err) {
    console.error("❌ becomeSeller error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
