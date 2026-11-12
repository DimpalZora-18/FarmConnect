const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { createProduct, getAllProducts, getSingleProduct,updateProduct, deleteProduct } = require("../controllers/productController")

router.post(
    "/",
    protect,
    authorize("farmer","supplier"),
    upload.single("image"),
    createProduct
);

router.get("/", getAllProducts);

router.get("/:id",getSingleProduct);

router.put(
    "/:id",
    protect,
    authorize("farmer","supplier"),
    upload.single("image"),
    updateProduct
);

router.delete(
    "/:id",
    protect,
    authorize("farmer","supplier"),
    deleteProduct
);

module.exports = router;