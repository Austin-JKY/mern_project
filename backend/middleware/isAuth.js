const jwt = require("jsonwebtoken");
const catchMiddleware = require("./catch");
const AppError = require("./appError");
const User = require("../models/userModel");

const isAuth = catchMiddleware(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new AppError("You are not logged in", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("User not found", 404));
    }
    req.user = currentUser;
    next();
});

module.exports = isAuth;
