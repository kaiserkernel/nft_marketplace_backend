const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the 'uploads/avatars' folder exists, create it if not
const avatarDir = path.join(__dirname, "..", "uploads", "avatars");

if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true }); // Creates the directory and any necessary subdirectories
}

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir); // Folder where avatars will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename based on timestamp
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

// Upload middleware
const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload;
