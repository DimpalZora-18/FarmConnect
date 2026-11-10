const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (req, res, next) => {

    console.log("Auth middleware reached");

    next();
};

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) {
            return res.status(401).json({
                message: "Not authorized. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        if(!token) {
            return res.status(401).json({
                message: "Not authorized. Invalid token format.",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if(decoded.type !== "access") {
            return res.status(401).json({
                message: "Invalid token type."
            });
        }

        const user = await User.findById(decoded.userId).select("_id name email role status");

        if(!user || user.status !== "active") {
            return res.status(401).json({
                message: "User not found or account is inactive."
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if(
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Not authorized. Invalid or expired token.",
            });
        }

        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }   
};

const authorize = (...roles) => {
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not allowed to perform this action."
            });
        }

        next();
    }
}

module.exports = {
    protect,
    authMiddleware,
    authorize
};