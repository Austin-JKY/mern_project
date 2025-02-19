const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/multer");
const { createPost, getAllPosts, getUsersPosts, saveunsavePost, deletePost, likeUnlikePost, addComment } = require("../controller/postController");

router.post("/create-post",isAuth,upload.single("image"),createPost);
router.get("/all",getAllPosts);
router.get("/user-posts/:id",getUsersPosts)
router.post("/save-unsave-post/:postId",isAuth,saveunsavePost);
router.post("/delete-post/:id",isAuth,deletePost);
router.post("/like-unlike-post/:id",isAuth,likeUnlikePost);
router.post("/comment/:id",isAuth,addComment);

module.exports = router;