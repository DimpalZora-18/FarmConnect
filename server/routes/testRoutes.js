const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You reached the protected route!"
    });
});

router.get("/admin", protect, authorize("admin"), (req,res) =>{
    res.json({
        message: "Welcome, Admin!"
    });
});

module.exports = router;