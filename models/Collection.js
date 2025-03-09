const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    name: String,
    symbol: String,
    metadataURI: String,
    owner: String,
    contractAddress: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Collection", CollectionSchema);
