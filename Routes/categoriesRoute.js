const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../Middlewares/verifyToken")
const  { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../Controllers/categoriesController")
const { validateObjectId } = require("../Middlewares/validateObjectId")



// /api/categories
router.route("/")
    .post(verifyTokenAndAdmin, createCategoryCtrl )
    .get(getAllCategoriesCtrl)

// /api/categories/:id
router.route("/:id").delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl )



module.exports =router;