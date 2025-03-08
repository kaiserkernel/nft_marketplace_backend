const Collection = require("../models/Collection");

// Create and save a new collection
const createCollection = async (req, res) => {
  try {
    const { name, symbol, description, image, metadataURI, owner, contractAddress } = req.body;

    const newCollection = new Collection({
      name,
      symbol, 
      description,
      image,
      metadataURI,
      owner,
      contractAddress
    });

    await newCollection.save();
    res.status(201).json({ message: "Collection saved successfully!", collection: newCollection });
  } catch (error) {
    res.status(500).json({ message: "Failed to save collection", msg: [error.message] });
  }
};

const getAllCollection = async (req, res) => {
    try {
        const allCollection = await Collection.find();
        res.status(200).json({message: "Collection fetched successfully", collections: allCollection});
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch collection", msg: [error.message] });
    }
}

module.exports = { createCollection, getAllCollection };
