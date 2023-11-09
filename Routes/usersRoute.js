const router = require("express").Router();

const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl,
  temporaryBlockUserCtrl,
} = require("../Controllers/usersControllers");

const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../Middlewares/verifyToken");

const {
  validateObjectId,
} = require("../Middlewares/validateObjectId");

const {
    photoSingleUpload
  } = require("../Middlewares/photoUpload");

// /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization, deleteUserProfileCtrl )

// /api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  //single : one picture (" photo name ")
  .post(verifyToken, photoSingleUpload, profilePhotoUploadCtrl);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

// /api/users/block-type/permanent-block/:id
router.route("/block-type/temporary-block/:id")
  .put(verifyTokenAndAdmin, temporaryBlockUserCtrl);


module.exports = router;
