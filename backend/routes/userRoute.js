const express = require("express");
const router = express.Router();
const { signup, veriftyaccount, resendOTP, login, logout, forgetPassword, restPassword, changePassword } = require("../controller/authController");
const isAuth = require("../middleware/isAuth");

router.post("/signup", signup);
router.post("/verify",isAuth,veriftyaccount);
router.post("/resend-otp",isAuth,resendOTP);
router.post("/login",login);
router.post("/logout",logout);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",restPassword);
router.post("/change-password",isAuth,changePassword);


module.exports = router;