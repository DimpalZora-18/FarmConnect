const express = require("express");
const {protect} = require("../middleware/authMiddleware.js");

const router = express.Router();

const { 
    registerUser,
    loginUser,
    googleLogin
} = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login",loginUser);

router.post("/google",googleLogin);

router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "You can access this protected route",
        user: req.user,
    });
});

module.exports = router;