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
        const { collection, owner, tokenId, tokenURI, royalty, currency } = req.body;

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
            royalty,
            currency
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

        const nfts = await NFT.aggregate([
            {
                $match: {
                collection: data, // Filter by collection
                },
            },
            {
                $lookup: {
                from: "users", // The name of the `User` collection
                let: { nftOwner: { $toLower: "$owner" } }, // Normalize NFT owner to lowercase
                pipeline: [
                    {
                    $match: {
                        $expr: { 
                        $eq: [{ $toLower: "$address" }, "$$nftOwner"] // Compare lowercased address to lowercased owner
                        },
                    },
                    },
                ],
                as: "user_info", // The alias for the user info
                },
            },
            {
                $unwind: {
                path: "$user_info", // Unwind the `user_info` array to get a single object
                preserveNullAndEmptyArrays: true, // Keep the NFT even if no match is found
                },
            },
            {
                $addFields: {
                ownerName: "$user_info.name", // Add the name of the owner to the NFT document
                },
            },
            {
                $project: {
                user_info: 0, // Remove the `user_info` field from the result (optional)
                },
            },
        ]);

        const _data = await Promise.all(nfts.map(async (log) => {
            const { data } = await axios.get(log.tokenURI);
            return {
                ...data,
                ...log,
                ownerName: log.ownerName || '',  // Add the 'name' field to the NFT object
            }
        }));
        return res.status(200).json({ message: "Get nft of collection successfully", data: _data })
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
        const data = await Promise.all(nfts.map(async (log) => {
            const { data } = await axios.get(log.tokenURI);
            return {
                ...data,
                ...log._doc,
            }
        }));

        return res.status(200).json({message: "Get owned nft successfully", nfts: data});
    } catch (error) {
        console.log(error, "Get owned nft error");
        res.status(500).json({ message: "Failed to retrieve own nfts", msg: [error.msg] })
    }
}

const setNotForSale = async (req, res) => {
    try {
        const { _id, tokenId } = req.body;
        
        if (!_id) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });

        // Find the NFT by _id and tokenId
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ message: "NFT not found" });
        }
        
        nft.priceType = "not_for_sale";  // Ensure price is always updated
        
        // Save the document to trigger pre-save middleware
        await nft.save();
        
        res.status(200).json({ message: "Price set successfully", data: nft });
    } catch (error) {
        console.log(error, "Get owned nft error");
        res.status(500).json({ message: "Failed to set price of nft", msg: [error.msg] })
    }
}

const setFixedPrice = async (req, res) => {
    try {
        const { _id, tokenId, price } = req.body;
        
        if (!_id) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });

        // Find the NFT by _id and tokenId
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ message: "NFT not found" });
        }
        
        nft.priceType = "fixed";
        nft.price = Number(price);  // Ensure price is always updated

        // Save the document to trigger pre-save middleware
        await nft.save();
        const nftData = await nft.populate("collection");
        const { data } = await axios.get(nftData.tokenURI);
        const nftInfo = {
            ...data,
            ...nftData._doc,
        }
        
        res.status(200).json({ message: "Price set successfully", data: nftInfo });
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
        const nft = await NFT.findById(_id);

        if (!nft) {
            return res.status(400).json({ message: "NFT not found" });
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

        const nft = await NFT.findOne({collection: data, tokenId});
        if (!nft) {
            return res.status(404).json({ msg: ["Not found nft"] })
        }

        nft.owner = owner,
        nft.lastPrice = price;
        nft.priceType = "not_for_sale";
        
        await nft.save();
    
        res.status(200).json({ message: "Failed to buy nft", data: nft })
    } catch (error) {
        console.log(error, "Buy nft error");
        res.status(500).json({ message: "Failed to buy nft", msg: [error.msg] })
    }
}

const bidNFT = async (req, res) => {
    try {
        const { _id, tokenId, bidAmount, bidder } = req.body;

        if (!_id || bidAmount === undefined || bidAmount === null || !bidder) 
            return res.status(400).json({ message: "Input Error", msg: ["Please provide all required fields"] });

        // Find the NFT by _id
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) return res.status(404).json({ msg: ["NFT not found"] });

        if (nft.priceType !== "auction") return res.status(404).json({ msg: ["NFT is not set as auction"] });
        
        // Check if the auction has ended
        if (new Date(nft.bidEndDate) < new Date()) return res.status(400).json({ msg: ["Auction has already ended"] });

        // Determine the current highest bid (startBid if no bids yet)
        let currentHighestBid = nft.startBid;
        if (nft.bidHistory.length > 0) currentHighestBid = nft.bidHistory[nft.bidHistory.length - 1].price;

        // Check if the bid amount is higher than the current highest bid
        if (bidAmount <= currentHighestBid) return res.status(400).json({ message: "Bid amount must be higher than the current highest bid" });

        // Add the new bid to the bidHistory
        nft.bidHistory.push({
            bidder,
            price: bidAmount,
            date: new Date(),
        });

        // Save the updated NFT document
        await nft.save();

        res.status(200).json({ message: "Bid placed successfully", data: nft });
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

const getAuctionInfo = async (req, res) => {
    try {
        const { _id } = req.body;

        const nft = await NFT.findById(_id).populate("collection");
        
        if (!nft) {
            return res.status(404).json({ msg: ["NFT not found"] });
        }
        
        const { data } = await axios.get(nft.tokenURI);

        nft.name = data.name;
        nft.image = data.image;
        nft.description = data.description;
        nft.attributes = data.attributes;

        const _data = { ...nft._doc, ...data }

        res.status(200).json({ data: _data });
    } catch (error) {
        console.error("Error fetching auction information:", error);
        res.status(500).json({ message: "Failed to fetch auction information", error: error.message });
    }
}

const endAuction = async (req, res) => {
    try {
      const { _id, winner, tokenId, winningBid } = req.body;

        if (!_id || !winner || !tokenId || !winningBid) 
            return res.status(400).json({ message: "Input Error", msg: ["Please provide all required fields"] });

        // Find the NFT by _id
        const nft = await NFT.findOne({ _id, tokenId });

        if (!nft) {
            return res.status(404).json({ msg: ["NFT not found"] });
        }
        
        if (winner === "0x0000000000000000000000000000000000000000") {
            nft.priceType = "not_for_sale";
            nft.price = null;
        } else {
            nft.priceType = "not_for_sale";
            nft.owner = winner;
            nft.lastPrice = winningBid;
            nft.price = null;
        }
        // if (nft.priceType !== "auction") {
        //     return res.status(404).json({ msg: ["NFT is not set as auction"] });
        // }
        
        // Check if the auction has ended
        // if (new Date(nft.bidEndDate) > new Date()) {
        //     return res.status(400).json({ msg: ["Auction isn't ended yet"] });
        // }

        await nft.save();
        res.status(200).json({ message: "Auction ended successfully"});
    } catch (error) {
        console.error("Error ending auction:", error);
        res.status(500).json({ message: "Failed to end auction", error: error.message });
    }
}

module.exports = { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setFixedPrice, buyNFT, setAuction, bidNFT, getTopAuctions, setNotForSale, getAuctionInfo, endAuction }
