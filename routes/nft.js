const express = require("express");
const { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setFixedPrice, buyNFT, setAuction, bidNFT, getTopAuctions } = require("../controllers/nftController");

const router = express.Router();

router.post("/mint", mintNFT);

router.post("/all", getAllNFT);

router.post("/collection", getNFTofCollection);

router.post("/own", getOwnNFT);

router.post("/fixed", setFixedPrice);

router.post("/buy", buyNFT);

router.post("/auction", setAuction);

router.post("/bid", bidNFT);

router.get("/top-auction", getTopAuctions);

module.exports = router;