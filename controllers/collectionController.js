const Collection = require("../models/Collection");

// Create and save a new collection
const createCollection = async (req, res) => {
  try {
    const { name, description, avatar, banner, metadataURI, contractAddress, creator } = req.body;

    const newCollection = new Collection({
      name,
      description,
      avatar,
      banner,
      metadataURI,
      contractAddress,
      creator
    });

    await newCollection.save();
    res.status(201).json({ message: "Collection saved successfully!", collection: newCollection });
  } catch (error) {
    res.status(500).json({ message: "Failed to save collection", error: error.message });
  }
};

module.exports = { createCollection };
