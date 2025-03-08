const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    name: String,
    description: String,
    avatar: String,   // IPFS URL
    banner: String,   // IPFS URL
    metadataURI: String, // IPFS metadata URL
    contractAddress: String,
    creator: String, // Wallet address
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Collection", CollectionSchema);
