const router = require("express").Router();

const { createCommentCtrl, getAllCommentsCtrl, deleteCommentsCtrl, updateCommentCtrl } = require("../Controllers/commentsController");

const { verifyToken, verifyTokenAndAdmin, verifyTokenAndOnlyUser } = require("../Middlewares/verifyToken");

const {validateObjectId,} = require("../Middlewares/validateObjectId");


// /api/auth/comments
router.route("/")
    .post(verifyToken, createCommentCtrl)
    .get(verifyTokenAndAdmin, getAllCommentsCtrl)

// /api/auth/comments/:id
router.route("/:id")
    .delete(validateObjectId, verifyToken, deleteCommentsCtrl)
    .put(validateObjectId, verifyToken, updateCommentCtrl )

module.exports = router