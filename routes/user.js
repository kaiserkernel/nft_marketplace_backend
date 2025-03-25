const express = require("express");
const upload = require("../middleware/upload"); // Import upload middleware
const { registerUser, getUserInfo } = require("../controllers/userController");

const router = express.Router();

router.post("/register", upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
]), registerUser);

router.post("/", getUserInfo);

module.exports = router;