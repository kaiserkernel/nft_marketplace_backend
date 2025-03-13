const express = require("express");
const { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT, setPrice, buyNFT } = require("../controllers/nftController");

const router = express.Router();

router.post("/mint", mintNFT);

router.post("/all", getAllNFT);

router.post("/collection", getNFTofCollection);

router.post("/own", getOwnNFT);

router.post("/price", setPrice);

router.post("/buy", buyNFT)

module.exports = router;