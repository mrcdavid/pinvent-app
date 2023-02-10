const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: [true, "Please add a token"],
    },
    createdAt: {
        type: Date,
        required: true,
        // default: Date.now,
        // expires: 43200,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
