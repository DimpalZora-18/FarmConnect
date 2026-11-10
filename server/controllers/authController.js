const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { generateAccessToken,generateRefreshToken } = require("../utils/tokenUtils.js");
const crypto = require("crypto");
const RefreshSession = require("../models/RefreshSession");
const mongoose = require("mongoose");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

const registerUser = async (req,res) =>{
    try{
        const { name, email, phone, password, role } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            phone,
            passwordHash,
            role
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role
            }
        });
    } catch (error) {
        console.log("Registration error:",error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


const loginUser = async (req,res) => {
    try {
        const { email,password } = req.body;
        
        //check required fields
        if(!email || !password){
            return res.status(400).json({
                message : "Email and password are required",
            });
        }

        //find user
        const user = await User.findOne({ email }).select("+passwordHash");

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!user.passwordHash) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        //compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const sessionId = new mongoose.Types.ObjectId();

        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(
            user,
            sessionId.toString()
        );

        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const data = await RefreshSession.create({
            _id: sessionId,
            user: user._id,
            tokenHash: tokenHash,
            expiresAt: new Date(Date.now()+ 2*24*60*60*1000)
        });

        res.cookie("refreshToken",refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 2*24*60*60*1000,
            path: "/api/auth"
        });

        // Temporary success response
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Server error",
        });
    }
}

const refreshAccessToken = async (req,res) =>{
    try{
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if(decoded.type !== "refresh") {
            return res.status(401).json({
                message: "Invalid token type"
            });
        }

        const session = await RefreshSession.findOne({
            _id: decoded.sessionId,
            user: decoded.userId,
            revokedAt: null,
            expiresAt: {
                $gt: new Date()
            }
        });

        if(!session) {
            return res.status(401).json({
                message: "Refresh session is invalid or expired"
            });
        }

        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        if(tokenHash !== session.tokenHash) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        const user = await User.findById(decoded.userId);

        if(!user || user.status !== "active") {
            return res.status(401).json({
                message: "User is unavailable"
            });
        }

        // const accessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(
            user,
            session._id.toString()
        );

        const newTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        // session.tokenHash = newTokenHash;
        // await session.save();

        const result = await RefreshSession.updateOne(
            {
                _id: session._id,
                user: decoded.userId,
                tokenHash: tokenHash,
                revokedAt: null,
                expiresAt: {
                    $gt: new Date()
                }
            },
            {
                $set: {
                     tokenHash: newTokenHash
                }
            }
        );

        if(result.modifiedCount !== 1) {
            return res.status(401).json({
                message: "Refresh token is invalid or already used"
            });
        }

        const accessToken = generateAccessToken(user);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 2 * 24 * 60 * 60 * 1000,
            path: "/api/auth"
        });

        return res.status(200).json({
            accessToken
        });

    }catch (error) {
    console.error("Refresh token error:", error.message);

    if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError"
    ) {
        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
}
}
const googleLogin = async (req,res) =>{
    try{
        const { credential } = req.body;

        if(!credential) {
            return res.status(400).json({
                message: "Google credential is required",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                message: "Google account email is not verified",
            });
        }
        const googleId = payload.sub;
        const email = payload.email.toLowerCase();
        const name = payload.name || email.split("@")[0];

        // 2. Find the user by their Google ID
        let user = await User.findOne({ googleId });

        // 3. If this Google account hasn't been linked yet,
        // look for an existing FarmConnect account by email.
        if (!user) {
            user = await User.findOne({ email });

            if (user) {
                // Don't link a different Google identity to an
                // account that is already linked.
                if (user.googleId && user.googleId !== googleId) {
                    return res.status(409).json({
                        message: "This account is linked to another Google account",
                    });
                }

                user.googleId = googleId;
                await user.save();
            } else {
                // 4. Create a new Google-authenticated user.
                // The schema's default role is "customer".
                user = await User.create({
                    name,
                    email,
                    googleId,
                });
            }
        }

        // 5. Don't allow suspended, rejected, or pending accounts
        // to bypass FarmConnect's account-status rules.
        if (user.status !== "active") {
            return res.status(403).json({
                message: "Your account is not active",
            });
        }

        // 6. Generate FarmConnect's own JWT
        // const token = jwt.sign(
        //     {
        //         userId: user._id,
        //         role: user.role,
        //     },
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: "1d",
        //     }
        // );

        const sessionId = new mongoose.Types.ObjectId();

        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(
            user,
            sessionId.toString()
        );

        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        //saving the session into mongodb
        await RefreshSession.create({
            _id: sessionId,
            user: user._id,
            tokenHash: tokenHash,
            expiresAt: new Date(Date.now() + 2*24*60*60*1000),
        });

        // console.log(data);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 2 * 24 * 60 * 60 * 1000,
            path: "/api/auth",
        });

        // 7. Return the same response shape as normal login
        return res.status(200).json({
            message: "Google login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Google login error:", error.message);

        return res.status(500).json({
            message: "Google authentication failed",
        });
    }
};

const logoutUser = async (req,res) => {
    console.log("LOGOUT CONTROLLER CALLED");
    try{
        const refreshToken = req.cookies.refreshToken;
        console.log("Refresh cookie exists:", !!req.cookies?.refreshToken);
        if(refreshToken) {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );

            console.log("Logout decoded sessionId:", decoded.sessionId);
            console.log("Logout decoded userId:", decoded.userId);

            if (decoded.type === "refresh"){
                await RefreshSession.findOneAndUpdate(
                    {
                        _id: decoded.sessionId,
                        user: decoded.userId,
                        revokedAt: null,
                    },
                    {
                        $set: {
                            revokedAt: new Date()
                        },
                    }
                );
            }
        }

        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
        });

        return res.status(200).json({
            message: "Logout successful"
        });

    }catch(error){
        console.error("Logout error:",error.message);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
        });

        if(
            ["TokenExpiredError", "JsonWebTokenError","NotBeforeError"].includes(error.name)
        ){
            return res.status(200).json({
                message: "Logout successful"
            });
        }

        return res.status(500).json({
            message: "Server error during logout",
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    refreshAccessToken,
    logoutUser
};