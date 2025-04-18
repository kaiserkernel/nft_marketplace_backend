const { default: axios } = require("axios");
const Collection = require("../models/Collection");

// Create and save a new collection
const createCollection = async (req, res) => {
  try {
    const { name, symbol, metadataURI, owner, contractAddress } = req.body;

    const newCollection = new Collection({
      name,
      symbol, 
      metadataURI,
      owner,
      contractAddress
    });

    await newCollection.save();
    res.status(201).json({ message: "Collection saved successfully!", collection: newCollection });
  } catch (error) {
    console.log(error, 'create collection')
    res.status(500).json({ message: "Failed to save collection", msg: [error.message] });
  }
};

const getOwnerCollection = async (req, res) => {
  try {
    const { owner } = req.body;
    if (!owner) {
      res.status(404).json({error: ""});
    }

    // Convert the input owner address to lowercase
    const normalizedOwner = owner.toLowerCase();

    const collections = await Collection.find({ owner: { $regex: new RegExp(`^${normalizedOwner}$`, 'i')} });
    res.status(200).json({message: "Owner get collections successfully", collection: collections});
  } catch (error) {
    console.log(error, 'find collection of owner');
    res.status(500).json({ message: "Failed to retrieve collection of owner", msg: [error.message] })
  }
}

const getAllCollection = async (req, res) => {
    try {
        const allCollection = await Collection.find();
        
        // Fetch metadata in parallel
        const _allCollection = await Promise.all(
          allCollection.map(async (log) => {
              const { data } = await axios.get(log.metadataURI); // Ensure axios uses `.get()`
              return { ...log.toObject(), ...data }; // Convert Mongoose document to plain object
          })
      );

      res.status(200).json({message: "Collection fetched successfully", data: _allCollection});
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch collection", msg: [error.message] });
    }
}

module.exports = { createCollection, getAllCollection, getOwnerCollection };
