const router = require("express").Router();
const { sendResetPasswordLinkCtrl, getResetPasswordLinkCtrl, resetPasswordLinkCtrl } = require("../Controllers/passwordController");



// /api/password/rest-password-link
router.post("/reset-password-link",sendResetPasswordLinkCtrl);

// /api/password/rest-password/:userId/:token
router.route("/reset-password/:userId/:token")
    .get(getResetPasswordLinkCtrl)
    .post(resetPasswordLinkCtrl);



module.exports = router;