const mongoose = require("mongoose");

const NFTSchema = new mongoose.Schema({
    collectionAddress: String,
    owner: String,
    tokenId: Number,
    tokenURI: String,
    royalty: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("NFT", NFTSchema);