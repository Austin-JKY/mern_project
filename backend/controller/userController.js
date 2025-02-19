const AppError = require("../middleware/appError");
const catchMiddleware = require("../middleware/catch");
const { uploadCloudinary } = require("../middleware/cloudinary");
const getDataUri = require("../middleware/dataUrl");
const User = require("../models/userModel");

exports.getProfile = catchMiddleware(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select(
      "-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpires -passwordConfirm"
    )
    .populate({
      parth: "posts",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "savePost",
        options: { sort: { createdAt: -1 } },
      },
    });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.editProfile = catchMiddleware(async (req, res, next) => {
  const { id } = req.user.id;

  const { bio } = req.body;
  const profilePic = req.file.filename;

  let cloudRes;
  if (profilePic) {
    const fileUri = getDataUri(profilePic);
    cloudRes = await uploadCloudinary(fileUri);
  }

  const user = await User.findByIdAndUpdate(id).select("-password");

  if (!user) return next(new AppError("User not found", 404));

  if (bio) user.bio = bio;
  if (profilePic) user.profilePic = cloudRes.url;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

exports.suggestUser = catchMiddleware(async (req, res, next) => {
  const loginUserId = req.user.id;
  const user = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpires -passwordConfirm"
  );
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });

});


exports.flowOfFlowers = catchMiddleware(async (req, res, next) => {
    const loginUserId = req.user._id;
    const targetUserId = req.params.id;

    if(loginUserId.toString() === targetUserId){
        return next(new AppError("You can't follow yourself", 400));
    }


    const targetUser = await User.findById(targetUserId);
    if(!targetUser){
        return next(new AppError("User not found", 404));
    }

    const isFollowing = targetUser.followers.includes(loginUserId);

    if(isFollowing){
        await Promise.all([
            User.updateOne(
                {_id: loginUserId},
                { $pull: { following: targetUserId }}
            ),
            User.updateOne(
                {_id: targetUserId},
                { $pull: { followers: loginUserId }}
            )
        ])
    }else{
        await Promise.all([
            User.updateOne(
                {_id: loginUserId},
                { $addToSet: { following: targetUserId }}
            ),
            User.updateOne(
                {_id: targetUserId},
                { $addToSet: { followers: loginUserId }}
            )
        ])
    }

    const updatedUser = await User.findById(loginUserId).select("-password");

    res.status(200).json({
        status: "success",
        message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
        data: {
            user: updatedUser
        }
    })
});

exports.getMe = catchMiddleware(async (req, res, next) => {
const user = req.user;
if(!user) return next(new AppError("User not found", 404));

res.status(200).json({
    status: "success",
    message: "Authenticated User",
    data: {
        user
    }
})
});