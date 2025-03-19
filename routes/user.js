const express = require("express");
const upload = require("../middlewares/upload"); // Import upload middleware
const { registerUser } = require("../controllers/userController");

const router = express.Router();

router.post("/register",  upload.single("avatar"), registerUser);

module.exports = router;