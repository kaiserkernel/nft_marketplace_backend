const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NFTSchema = new Schema({
    collection: {
        type: Schema.Types.ObjectId,
        ref: "Collection"
    },
    owner: String,
    tokenId: Number,
    tokenURI: String,
    royalty: Number,
    startBid: {
        type: Number,
        default: null
    },
    bidHistory: [{
        price: Number,
        date: Date
    }],
    bidEndDate: {
        type: Date,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastPrice: {
        type: Number,
        default: 0
    },
    priceType: {
        type: String,
        enum: ['fixed', 'auction']
    }
});

// Pre-save hook to modify fields based on priceType
NFTSchema.pre('save', function(next) {
    // Ensure priceType change is only allowed after auction ends
    const auctionOngoing = this.priceType === "auction" && (this.bidHistory && this.bidHistory.length > 0);

    if (this.isModified('priceType')) {
        // Prevent switching to 'fixed' if auction is ongoing
        if (this.priceType === 'fixed' && auctionOngoing) {
            return next(new Error("Cannot change price type to 'fixed' while the auction is still ongoing."));
        }
        // Prevent switching to 'auction' if auction is ongoing (this might be redundant but keeps the logic explicit)
        if (this.priceType === 'auction' && auctionOngoing) {
            return next(new Error("Cannot change price type to 'auction' while the auction is still ongoing."));
        }
    }

    // Reset fields based on priceType
    if (this.priceType === 'fixed') {
        this.startBid = null;
        this.bidHistory = [];
        this.bidEndDate = null;
    } else if (this.priceType === 'auction') {
        this.price = null;
    }

    next();
});

module.exports = mongoose.model("NFT", NFTSchema);
