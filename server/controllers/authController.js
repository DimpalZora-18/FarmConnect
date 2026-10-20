const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { generateAccessToken,generateRefreshToken } = require("../utils/tokenUtils.js");

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

        console.log("Password matched:", isPasswordCorrect);

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

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
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // 7. Return the same response shape as normal login
        return res.status(200).json({
            message: "Google login successful",
            token,
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



module.exports = {
    registerUser,
    loginUser,
    googleLogin
};