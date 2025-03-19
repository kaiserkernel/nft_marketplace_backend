const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    address: {
        type: String,
        unique: true,
        required: true, // Ensures address is always provided
        trim: true // Removes unnecessary spaces
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "" // Prevents undefined values
    },
    avatar: {
        type: String
    },
    socialLinks: {
        twitter: { type: String, trim: true },
        youtube: { type: String, trim: true },
        telegram: { type: String, trim: true },
        discord: { type: String, trim: true },
        instagram: { type: String, trim: true },
        tiktok: { type: String, trim: true }
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("User", UserSchema);
