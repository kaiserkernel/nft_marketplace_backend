const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NFTSchema = new mongoose.Schema({
    collection: {
        type: Schema.Types.ObjectId,
        ref: "Collection"
    },
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