const express = require("express");
const { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setFixedPrice, buyNFT, setAuction, bidNFT } = require("../controllers/nftController");

const router = express.Router();

router.post("/mint", mintNFT);

router.post("/all", getAllNFT);

router.post("/collection", getNFTofCollection);

router.post("/own", getOwnNFT);

router.post("/fixed", setFixedPrice);

router.post("/buy", buyNFT);

router.post("/auction", setAuction);

router.post("/bid", bidNFT);

module.exports = router;