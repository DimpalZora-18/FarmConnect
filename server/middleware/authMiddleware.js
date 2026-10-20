const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    console.log("Auth middleware reached");

    next();
};

const protect = (req, res, next) => {
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

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized. Invalid or expired token.",
        });
    }   
};

module.exports = {
    protect,
    authMiddleware,
};