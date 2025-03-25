const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Directories for saving avatar and banner images
const avatarDir = path.join(__dirname, "..", "public", "avatars");
const bannerDir = path.join(__dirname, "..", "public", "banners");

// Ensure the directories exist, create them if not
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
}

// Set storage engine for both avatar and banner images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "avatar") {
            cb(null, avatarDir); // Store avatar images in 'avatars' folder
        } else if (file.fieldname === "banner") {
            cb(null, bannerDir); // Store banner images in 'banners' folder
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."), false);
    }
};

// Upload middleware for multiple fields
const upload = multer({ 
    storage, 
    fileFilter,
    // limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload;
