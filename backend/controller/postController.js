const sharp = require("sharp");
const catchMiddleware = require("../middleware/catch");
const { uploadCloudinary, cloudinary } = require("../middleware/cloudinary");
const Post = require("../models/postModel");
const User = require("../models/userModel");

exports.createPost = catchMiddleware(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const user = req.user._id;

  if (!image) return next(new AppError("Please upload an image", 400));

  const optimizedImage = await sharp(image.buffer)
    .resize({
      width: 500,
      height: 500,
      fit: "inside",
    })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  const fileUri = `data:image/jpeg;base64,${optimizedImage.toString("base64")}`;

  const cloudRes = await uploadCloudinary(fileUri);

  let post = await Post.create({
    caption,
    image: {
      url: cloudRes.secure_url,
      public_id: cloudRes.public_id,
    },
    user: user,
  });

  const userId = await User.findById(user);
  if (userId) {
    userId.posts.push(post._id);
    await userId.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: "user",
    select: "username email bio profilePic",
  });

  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: {
      post,
    },
  });
});

exports.getAllPosts = catchMiddleware(async (req, res, next) => {
  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username email bio profilePic",
    })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePic",
      },
    })
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.getUsersPosts = catchMiddleware(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePic",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.saveunsavePost = catchMiddleware(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));
  const isPostSaved = user.savePosts.includes(postId);

  if (isPostSaved) {
    user.savePost.pull(postId);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "success",
      message: "Post unsaved successfully",
      data: {
        user,
      },
    });
  } else {
    user.savePost.push(postId);
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "success",
      message: "Post saved successfully",
      data: {
        user,
      },
    });
  }
});

exports.deletePost = catchMiddleware(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findByIdAndDelete(id).populate("user");
  if (!post) return next(new AppError("Post not found", 404));

  if (post.user._id.toString() !== userId.toString()) {
    return next(
      new AppError("You are not authorized to delete this post", 401)
    );
  }

  await User.updateOne({ _id: userId }, { $pull: { posts: id } });

  await User.updateMany({ savePosts: id }, { $pull: { savePosts: id } });

  await Comment.deleteMany({ post: id });

  if (post.image.public_id) {
    await cloudinary.uploader.destroy(post.image.public_id);
  }

  await Post.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Post deleted successfully",
  });
});


exports.likeUnlikePost = catchMiddleware(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;


    const post = await Post.findById(id);
    if (!post) return next(new AppError("Post not found", 404));

    const isPostLiked = post.likes.includes(userId);

    if(isPostLiked){
        await Post.findByIdAndUpdate(id, {$pull: {likes: userId}},{new: true});
        return res.status(200).json({
            status: "success",
            message: "Post unliked successfully",
            data: {
                post,
            },
        });
    }else{
        await Post.findByIdAndUpdate(id, {$addToSet: {likes: userId}},{new: true});
    }
      
});

exports.addComment = catchMiddleware(async (req, res, next) => {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;
  
    if (!text) return next(new AppError("Comment text is required", 400));
  
    // Ensure the post exists
    const post = await Post.findById(postId);
    if (!post) return next(new AppError("Post not found", 404));
  
    // Create the comment
    const comment = await Comment.create({
      text,
      user: userId,
      post: postId,
    });
  
    // Add the comment to the post
    post.comments.push(comment._id);
    await post.save();
  
    // Populate user details for response
    const populatedComment = await comment.populate({
      path: "user",
      select: "username profilePic",
    });
  
    res.status(201).json({
      status: "success",
      message: "Comment added successfully",
      data: {
        comment: populatedComment,
      },
    });
  });
  