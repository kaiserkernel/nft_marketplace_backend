const Collection = require("../models/Collection");
const NFT = require("../models/NFT");
const mongoose = require("mongoose");

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

const setPrice = async (req, res) => {
    try {
        const { _id, tokenId, price } = req.body;
        
        if (!_id || !price) 
            return res.status(400).json({ message: "Input Error", msg: ["Please input fields"] });

        // Use await to ensure the operation completes
        await NFT.findOneAndUpdate(({_id, tokenId}), { price }, { new: true });

        res.status(200).json({ message: "Price set successfully" });
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

module.exports = { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setPrice, buyNFT }
