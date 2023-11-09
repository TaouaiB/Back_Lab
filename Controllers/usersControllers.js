const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../Models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { Post } = require("../Models/Post");
const { Comment } = require("../Models/Comment");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");

/**-----------------------------------------------------
*   @desc Get All Users Profile
*   @route /api/users/profile
*   @method GET
*   @access private (only admin)
------------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});

/**-----------------------------------------------------
*   @desc Get User Profile
*   @route /api/users/profile/:id
*   @method GET
*   @access public
------------------------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");

  if (!user) {
    return res.status(404).json({ message: " user not found " });
  }

  res.status(200).json(user);
});

/**-----------------------------------------------------
*   @desc Update User Profile
*   @route /api/users/profile
*   @method PUT
*   @access private (only user himself)
------------------------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password")
  .populate("posts");

  res.status(200).json(updateUser);
});

/**-----------------------------------------------------
*   @desc Get Users Count
*   @route /api/users/count
*   @method GET
*   @access private (only admin)
------------------------------------------------------*/
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const count = await User.count();
  res.status(200).json(count);
});

/**-----------------------------------------------------
*   @desc Profile Photo Upload
*   @route /api/users/profile/profile-photo-upload
*   @method POST
*   @access private (only logged in user)
------------------------------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  //1. Validation
  if (!req.file) {
    return res.status(400).json({ message: " no file provided " });
  }

  //2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  //3. Upload to Cloundinary
  const result = await cloudinaryUploadImage(imagePath);
  console.log(result);

  //4. Get the user from DB
  const user = await User.findById(req.user.id);

  //5. Delete the old profile Photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  //6. Change the profile field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  //7. Send response to client
  res.status(200).json({
    message: " your profile photo uploaded successfully ",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  //8. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**-----------------------------------------------------
*   @desc Delete Users Profile ( Account )
*   @route /api/users/profile/:id
*   @method DELETE
*   @access private (only admin or user himself)
------------------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  // 1. Get user From DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: " user not found " });
  }
  //  2. Get all posts from DB
  const posts = await Post.find({ user: user._id });

  //  3. Get the public ids from the posts
  const publicIds = posts?.map((post) => post.image.publicId);  // we use map cause we need array for publicIds

  //  4. Delete all posts image from cloudinary that belong to this user
  if(publicIds?.length > 0){
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  // 5. Delete the profile picture from cloudinary
  if(user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  //6. Delete user posts & comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });
  
  

  // 7. Delete the user himself
  await User.findByIdAndDelete(req.params.id);

  // 8. Send a response to the client
  res.status(200).json({ message: "your profile has been deleted" });
});


/**-----------------------------------------------------
*   @desc Temporary Block a User
*   @route /api/users/block-type/temporary-block/:id
*   @method PUT
*   @access private (only admin)
------------------------------------------------------*/
module.exports.temporaryBlockUserCtrl = asyncHandler(async (req, res) => {
  // 1. Check if the user exists
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 3. Toggle Block
  user.isBlocked = !user.isBlocked;

  // 4. Save the updated user
  await user.save();

  // 5. Send response to client

  if (user.isBlocked) {
    return res.status(200).json({ message: "User temporarily blocked" });
  } else {
    return res.status(200).json({ message: "User unblocked" });
  }

});

// /**-----------------------------------------------------
// *   @desc Permanently Block a User
// *   @route /api/users/block-type/permanent-block/:id
// *   @method PUT
// *   @access private (only admin)
// ------------------------------------------------------*/
// module.exports.permanentBlockUserCtrl = asyncHandler(async (req, res) => {

//     // 1. Check if the user exists
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 2. Check if the user is already blocked
//     if (user.isBlocked) {
//       return res.status(400).json({ message: "User is already blocked" });
//     }

//     // 3. Move the user's email to the BlockedUsers model
//     const blockedUser = new BlockedUser({
//       blockedEmails: [user.email],
//     });

//     // 4. Save the updated blockedUser
//     await blockedUser.save();

//     // 5. Call the `deleteUserProfileCtrl` function to delete the user's profile
//     await deleteUserProfileCtrl(req, res);
    
//     // 6. Send a response to the client
//     return res.status(200).json({ message: "User permanently blocked" });

// });