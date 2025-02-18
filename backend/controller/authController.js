const path = require("path");
require("dotenv").config();
const AppError = require("../middleware/appError");
const catchMiddleware = require("../middleware/catch");
const generateOTP = require("../middleware/generateOTP");
const User = require("../models/userModel");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const hbs = require("hbs");
const sendEmail = require("../middleware/email");
const { createSecureServer } = require("http2");

const loadTemple = (templeName, replacement) => {
  const templePath = path.join(__dirname, "../emailTemplate", templeName);
  const source = fs.readFileSync(templePath, "utf-8");
  const template = hbs.compile(source);
  return template(replacement);
};
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };
  res.cookie("token", token, cookieOption);
  user.password = undefined;
  user.otp = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchMiddleware(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const exitUser = await User.findOne({ email });

  if (exitUser) {
    return next(new AppError("User already exists", 400));
  }
  const otp = generateOTP();
  const otpExpiry = Date.now() + 24 * 60 * 60 * 100;
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpiry,
  });

  const htmlTemplate = loadTemple("otpTemplate.hbs", {
    title: "OTP Verification",
    username: newUser.username,
    otp,
    message: "Your one-time password (OTP) for account verification is : ",
  });
  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP Verification",
      html: htmlTemplate,
    });
    createSendToken(
      newUser,
      201,
      res,
      "Registered Successfully. Please check your email to verify your account"
    );
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(new AppError(err.message, 500));
  }
});

exports.veriftyaccount = catchMiddleware(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError("OTP is required for verification", 400));
  }

  const user = req.user;
  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return next(new AppError("Invalid OTP or OTP has expired", 400));
  }
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true;
  await user.save({
    validateBeforeSave: false,
  });
  createSendToken(user, 200, res, "Account verified successfully");
});

exports.resendOTP = catchMiddleware(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.isVerified) {
    return next(new AppError("User is already verified", 400));
  }
  const otp = generateOTP();
  const otpExpiry = Date.now() + 24 * 60 * 60 * 100;
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });
  const htmlTemplate = loadTemple("otpTemplate.hbs", {
    title: "OTP Verification",
    username: user.username,
    otp,
    message: "Your one-time password (OTP) for account verification is : ",
  });
  try {
    await sendEmail({
      email: user.email,
      subject: "Resend OTP",
      html: htmlTemplate,
    });
    res.status(200).json({
      status: "success",
      message: "New OTP sent successfully",
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
});

exports.login = catchMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (!user.isVerified) {
    return next(new AppError("User is not verified", 401));
  }
  createSendToken(user, 200, res, "Logged in successfully");
});

exports.logout = catchMiddleware((req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.forgetPassword = catchMiddleware(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const otp = generateOTP();
  const resetExpirs = Date.now() + 300000;
  user.resetPasswordOTP = otp;
  user.resetPasswordExpires = resetExpirs;
  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemple("otpTemplate.hbs", {
    title: "Reset Password",
    username: user.username,
    otp,
    message: "Your one-time password (OTP) for password reset is : ",
  });
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      html: htmlTemplate,
    });
    res.status(200).json({
      status: "success",
      message: "Email sent successfully",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(err.message, 500));
  }
});

exports.restPassword = catchMiddleware(async (req, res, next) => {
        const { email, otp, password, passwordConfirm } = req.body;
      
        if (!email || !otp || !password || !passwordConfirm) {
          return next(new AppError("Please provide all required fields", 400));
        }
      
        // Find the user by email
        const user = await User.findOne({ email });
      
        if (!user) {
          return next(new AppError("User not found", 404));
        }
      
        // Validate OTP
        if (user.resetPasswordOTP !== otp || user.resetPasswordExpires < Date.now()) {
          return next(new AppError("Invalid or expired OTP", 400));
        }
      
        // Validate password match
        if (password !== passwordConfirm) {
          return next(new AppError("Passwords do not match", 400));
        }
      
        // Reset password and clear OTP fields
        user.password = password;
        user.passwordConfirm = passwordConfirm;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
    await user.save();
  createSendToken(user, 200, res, "Password reset successfully");
});

exports.changePassword = catchMiddleware(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(new AppError("Please provide all required fields", 400));
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError("Incorrect current password", 401));
    }

    if (newPassword !== newPasswordConfirm) {
      return next(new AppError("New passwords do not match", 400));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();
  
    createSendToken(user, 200, res, "Password changed successfully");
  });
  