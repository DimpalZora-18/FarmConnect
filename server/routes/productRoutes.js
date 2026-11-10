const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { createProduct, getAllProducts, getSingleProduct } = require("../controllers/productController")

router.post(
    "/",
    protect,
    authorize("farmer","supplier"),
    upload.single("image"),
    createProduct
);

router.get("/", getAllProducts);

router.get("/:id",getSingleProduct);

module.exports = router;