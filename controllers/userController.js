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

        // Access the uploaded files
        const avatarImage = req.files.avatar ? `/public/avatars/${req.files.avatar[0].filename}` : null;
        const bannerImage = req.files.banner ? `/public/banners/${req.files.banner[0].filename}` : null;

        if (existingUser) {
            // Update user
            existingUser.name = name;
            existingUser.description = description;
            if (avatarImage)
                existingUser.avatar = avatarImage;
            if (bannerImage)
                existingUser.banner = bannerImage;
            existingUser.socialLinks = _socialLinks;

            await existingUser.save();
            return res.status(201).json({ message: "Successfully saved user info", data: existingUser });
        } else {
            // Create new user
            const newUser = new User({
                address: normalizedOwner,
                name,
                description: description || "",
                avatar: avatarImage, // Save avatar URL
                banner: bannerImage, // Save banner URL
                socialLinks: _socialLinks
            });
            await newUser.save();
            return res.status(201).json({ message: "Successfully saved user info", data: newUser });
        }

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ msg: ["Failed to register user"], msg: [error.message] });
    }
};

const getUserInfo = async (req, res) => {
    const { address } = req.body;

    try {
        let _address = address.toLowerCase();
        const user = await User.findOne({address: _address});
    
        if (!user) {
            return res.status(200).json({ data: null })
        }
    
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ msg: ["User find error"] })
    }
}

module.exports = { registerUser, getUserInfo }