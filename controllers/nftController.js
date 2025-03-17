const mongoose = require("mongoose");
const { default: axios } = require("axios");

const Collection = require("../models/Collection");
const NFT = require("../models/NFT");

const convertToObjectID = (_str) => {
        // Check if collection string can be converted to a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(_str)) {
            return { success: false};
        }

        // Convert the string 'collection' into an ObjectId
        const _collection = new mongoose.Types.ObjectId(_str);
        return { success: true, data: _collection };
}

// Mint nft
const mintNFT = async (req, res) => {
    try {
        const { collection, owner, tokenId, tokenURI, royalty } = req.body;

        // Validate inputs
        if (!collection || !owner || !tokenId || !tokenURI || !royalty) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const collectionData = await Collection.findOne({contractAddress: collection});

        const newNFT = new NFT({
            collection: collectionData._id,
            owner,
            tokenId,
            tokenURI,
            royalty
        });

        await newNFT.save();
        res.status(201).json({ message: "NFT saved successfully!", nft: newNFT });
    } catch (error) {
        console.log(error, 'Mint nft');
        res.status(500).json({ message: "Failed to mint NFT", msg: [error.message] })
    }
}

const getAllNFT = async (req, res) => {
    try {
        const allNFT = await NFT.find();
        res.status(200).json({ message: "Get all NFT successfully", nfts: allNFT });
    } catch (error) {
        console.log(error, 'Get all NFT');
        res.status(500).json({ message: "Failed to retrieve all nft", msg: [error.message] })
    }
}

const getNFTofCollection = async (req, res) => {
    try {
        const { collection } = req.body;

        const {success, data} = convertToObjectID(collection);

        if (!success) 
            return res.status(400).json({ msg: ["Invalid collection ObjectId format"] });

        const nfts = await NFT.find({collection: data});
        return res.status(200).json({ message: "Gel nft of collection successfully", data: nfts })
    } catch (error) {
        console.log(error, 'Get NFT of a collection');
        res.status(500).json({ message: "Failed to retrieve nft of collection", msg: [error.message] })
    }
}

const getOwnNFT = async (req, res) => {
    try {
        const { address } = req.body;
    
        if (!address) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input address"] });
        
        // Convert the input owner address to lowercase
        const normalizedOwner = address.toLowerCase();
        
        const nfts = await NFT.find({owner: { $regex: new RegExp(`^${normalizedOwner}$`, 'i')}}).populate("collection");

        return res.status(200).json({message: "Get owned nft successfully", nfts});
    } catch (error) {
        console.log(error, "Get owned nft error");
        res.status(500).json({ message: "Failed to retrieve own nfts", msg: [error.msg] })
    }
}

const setFixedPrice = async (req, res) => {
    try {
        const { _id, tokenId, price } = req.body;
        
        if (!_id || !price) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });

        // Find the NFT by _id and tokenId
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ message: "NFT not found" });
        }

        // Update the price
        nft.priceType = "fixed";
        nft.price = price;

        // Save the document to trigger pre-save middleware
        await nft.save();

        res.status(200).json({ message: "Price set successfully", data: nft });
    } catch (error) {
        console.log(error, "Get owned nft error");
        res.status(500).json({ message: "Failed to set price of nft", msg: [error.msg] })
    }
}

const setAuction = async (req, res) => {
    try {
        const { _id, tokenId, startBid, bidEndDate } = req.body;

        if (!_id || !tokenId || startBid === undefined || bidEndDate === undefined) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });

        // Find the NFT by _id
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ message: "NFT not found" });
        }
        
        if (nft.bidHistory && nft.bidHistory.length > 0)
            return res.status(400).json({msg: ["Some already bid. Can't reset auction"]});

        // Calculate the correct auction end timestamp
        const auctionEndTimestamp = bidEndDate * 1000; // Convert duration to milliseconds
        const auctionEndDate = new Date(auctionEndTimestamp); // Convert timestamp to Date object
        
        // Set auction details
        nft.priceType = "auction";
        nft.startBid = startBid;
        nft.bidHistory = [];
        nft.bidEndDate = auctionEndDate; // Save correct auction end date
        
        // Save the document to trigger pre-save middleware
        await nft.save();

        res.status(200).json({ message: "Auction set successfully", data: nft });
    } catch (error) {
        console.log(error, "Get owned nft error");
        res.status(500).json({ message: "Failed to set price of nft", msg: [error.msg] })
    }
}

const buyNFT = async (req, res) => {
    try {
        const { collection, owner, tokenId, price } = req.body;
        
        if (!collection || !owner) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });
    
        const {success, data} = convertToObjectID(collection);

        if (!success) 
            return res.status(400).json({ msg: ["Invalid collection ObjectId format"] });

        await NFT.findOneAndUpdate(({collection: data, tokenId}, { owner, lastPrice: price }, { new: true }));
    
        res.status(200).json({ message: "Failed to buy nft", msg: [error.msg] })
    } catch (error) {
        console.log(error, "Buy nft error");
        res.status(500).json({ message: "Failed to buy nft", msg: [error.msg] })
    }
}

const bidNFT = async (req, res) => {
    try {
        const { _id, tokenId, bidAmount } = req.body;

        if (!_id || bidAmount === undefined || bidAmount === null) 
            return res.status(400).json({ message: "Input Error", msg: ["Please provide all required fields"] });

        // Find the NFT by _id
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ msg: ["NFT not found"] });
        }

        if (nft.priceType !== "auction") {
            return res.status(404).json({ msg: ["NFT is not set as auction"] });
        }
        
        // Check if the auction has ended
        if (new Date(nft.bidEndDate) < new Date()) {
            return res.status(400).json({ msg: ["Auction has already ended"] });
        }

        // Determine the current highest bid (startBid if no bids yet)
        let currentHighestBid = nft.startBid;
        if (nft.bidHistory.length > 0) {
            // Get the most recent bid from bidHistory
            currentHighestBid = nft.bidHistory[nft.bidHistory.length - 1].price;
        }

        // Check if the bid amount is higher than the current highest bid
        if (bidAmount <= currentHighestBid) {
            return res.status(400).json({ message: "Bid amount must be higher than the current highest bid" });
        }

        // Add the new bid to the bidHistory
        nft.bidHistory.push({
            price: bidAmount,
            date: new Date()
        });

        // Save the updated NFT document
        await nft.save();

        res.status(200).json({ message: "Bid placed successfully", currentHighestBid: bidAmount });
    } catch (error) {
        console.log(error, "Auction nft error");
        res.status(500).json({ message: "Failed to buy nft", msg: [error.msg] })
    }
}

const getTopAuctions = async (req, res) => {
    try {
        const topAuctions = await NFT.find({ priceType: "auction" }) // Filter only auction NFTs
            .sort({ startBid: -1 }) // Sort in descending order (highest startBid first)
            .limit(5); // Get only the top 5

        const data = await Promise.all(topAuctions.map(async (log) => {
            const { data } = await axios.get(log.tokenURI);
            return {
                ...data,
                ...log._doc,
            }
        }));

        res.status(200).json({ data });
    } catch (error) {
        console.error("Error fetching top auctions:", error);
        res.status(500).json({ message: "Failed to fetch top auctions", error: error.message });
    }
};

module.exports = { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setFixedPrice, buyNFT, setAuction, bidNFT, getTopAuctions }
