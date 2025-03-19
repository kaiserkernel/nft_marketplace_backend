const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { address, name, description, socialLinks } = req.body;

        const _socialLinks = JSON.parse(socialLinks);

        if (!address || !name) {
            return res.status(400).json({ msg: ["Address and name are required"] });
        }

        // Normalize address
        const normalizedOwner = address.toLowerCase();
        
        // Check for existing user
        const existingUser = await User.findOne({ address: { $regex: new RegExp(`^${normalizedOwner}$`, 'i') } });

        // Avatar file path (if uploaded)
        const avatar = req.file ? `/public/avatars/${req.file.filename}` : "";

        if (existingUser) {
            // Update user
            existingUser.name = name;
            existingUser.description = description;
            existingUser.avatar = avatar;
            existingUser.socialLinks = _socialLinks;

            await existingUser.save();
            return res.status(201).json({ message: "Successfully saved user info", data: newUser });
        } else {
            // Create new user
            const newUser = new User({
                address: normalizedOwner,
                name,
                description: description || "",
                avatar, // Save avatar URL
                socialLinks: _socialLinks
            });
            await newUser.save();
            return res.status(201).json({ message: "Successfully saved user info", data: newUser });
        }

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ msg: ["Failed to register user"], error: error.message });
    }
};

const getUserInfo = async (req, res) => {
    const { address } = req.body;

    try {
        const user = await User.findOne({address});
    
        if (!user) {
            return res.status(404).json({ msg: ["User not found"] })
        }
    
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ msg: ["User find error"] })
    }
}

module.exports = { registerUser, getUserInfo }