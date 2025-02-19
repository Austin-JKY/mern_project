const express = require("express");
const router = express.Router();
const {getProfile, editProfile, suggestUser, flowOfFlowers, getMe} = require("../controller/userController");
const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/multer");

router.get("/profile/:id",getProfile);
router.post("/edit-profile/:id",isAuth,upload.single("profilePic"),editProfile);
router.get("/suggest-users",isAuth,suggestUser);
router.post("/follow-unfollow/:id",isAuth,flowOfFlowers);
router.get("/me",isAuth,getMe)

module.exports = router;