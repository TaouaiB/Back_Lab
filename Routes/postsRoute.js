const router = require("express").Router();

const {
    photoSingleUpload,
    } = require("../Middlewares/photoUpload");

const {
    verifyToken,
    } = require("../Middlewares/verifyToken");

const {
    createPostCtrl,
    getAllPostsCtrl,
    getSinglePostCtrl,
    getPostCountCtrl,
    deletePostCtrl,
    updatePostCtrl,
    updatePostImageCtrl,
    toggleLikeCtrl,
    } = require("../Controllers/postController");

const {
    validateObjectId,
    } = require("../Middlewares/validateObjectId");

// /api/posts
router.route("/")
    .post(verifyToken, photoSingleUpload, createPostCtrl)
    .get(getAllPostsCtrl);

// /api/posts/count
router.route("/count").get(getPostCountCtrl)

// /api/posts/:id
router.route("/:id")
    .get(validateObjectId, getSinglePostCtrl)
    .delete(validateObjectId, verifyToken, deletePostCtrl)
    .put(validateObjectId, verifyToken, updatePostCtrl)

// /api/posts/update-image/:id
router.route("/update-image/:id")
    .put(validateObjectId, verifyToken, photoSingleUpload, updatePostImageCtrl)

// /api/posts/like/:id
router.route("/like/:id")
    .put(validateObjectId,verifyToken,toggleLikeCtrl)

module.exports = router