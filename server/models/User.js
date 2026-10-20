const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true
        },

        phone: {
            type: String,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "farmer", "supplier", "delivery", "admin"],
            default: "customer"
        },

        status: {
            type: String,
            enum: ["pending", "active", "suspended", "rejected"],
            default: "active"
        },
        passwordHash: {
            type: String,
            required: false,
            select: false
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);