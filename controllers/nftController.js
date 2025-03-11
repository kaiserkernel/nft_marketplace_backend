const NFT = require("../models/NFT");

// Mint nft
const mintNFT = async (req, res) => {
    try {
        const { collectionAddress, owner, tokenId, tokenURI, royalty } = req.body;

        const newNFT = new NFT({
            collectionAddress,
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
        const { contractAddress } = req.body;
        const nfts = await NFT.find({contractAddress});

        return res.status(200).json({ message: "Gel nft of collection successfully", nfts })
    } catch (error) {
        console.log(error, 'Get NFT of a collection');
        res.status(500).json({ message: "Failed to retrieve nft of collection", msg: [error.message] })
    }
}

module.exports = { mintNFT, getAllNFT, getNFTofCollection }
