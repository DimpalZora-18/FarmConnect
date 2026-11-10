const mongoose = require("mongoose");

const refreshSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tokenHash:{
        type: String,
        required: true
    },
    expiresAt:{
        type : Date,
        required:true
    },
    revokedAt:{
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("RefreshSession",refreshSessionSchema);