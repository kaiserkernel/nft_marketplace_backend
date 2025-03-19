const express = require("express");
const upload = require("../middleware/upload"); // Import upload middleware
const { registerUser, getUserInfo } = require("../controllers/userController");

const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);

router.post("/", getUserInfo);

module.exports = router;