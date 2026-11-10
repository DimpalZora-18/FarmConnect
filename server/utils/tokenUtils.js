const jwt = require("jsonwebtoken");

const generateAccessToken = (user) =>{
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            type: "access"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
}

const generateRefreshToken = (user,sessionId) =>{
    return jwt.sign(
        {
            userId: user._id,
            role: user.role,
            type: "refresh",
            sessionId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "2d"
        }
    );
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
};