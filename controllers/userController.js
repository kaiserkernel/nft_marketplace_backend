const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { address, name, description, links } = req.body;

        if (!address || !name) {
            return res.status(400).json({ msg: ["Address and name are required"] });
        }

        // Normalize address
        const normalizedOwner = address.toLowerCase();
        
        // Check for existing user
        const existingUser = await User.findOne({ address: { $regex: new RegExp(`^${normalizedOwner}$`, 'i') } });

        if (existingUser) {
            return res.status(400).json({ msg: ["Existing user"] });
        }

        // Avatar file path (if uploaded)
        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : "";

        // Create new user
        const newUser = new User({
            address: normalizedOwner,
            name,
            description: description || "",
            avatar, // Save avatar URL
            links
        });

        await newUser.save();

        return res.status(201).json({ message: "Successfully saved user info", data: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ msg: ["Failed to register user"], error: error.message });
    }
};

module.exports = { registerUser }