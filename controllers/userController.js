const User = require("../models/User");

const registerUser = async (req, res) => {
    try {
        const { address, name, description, links } = req.body;

        if (!address || !name) {
            return res.status(400).json({ msg: ["Address and name are required"] });
        }

        // Convert the input owner address to lowercase
        const normalizedOwner = address.toLowerCase();
        
        // Check if the user already exists (case-insensitive)
        const existingUser = await User.findOne({ address: { $regex: new RegExp(`^${normalizedOwner}$`, 'i') } });

        if (existingUser) {
            return res.status(400).json({ msg: ["Existing user"] });
        }

        const newUser = new User({
            address: normalizedOwner, // Ensure address is always stored in lowercase
            name,
            description: description || "", // Default to empty string if undefined
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