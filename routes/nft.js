const express = require("express");
const { mintNFT, getAllNFT, getNFTofCollection, getOwnNFT } = require("../controllers/nftController");

const router = express.Router();

router.post("/mint", mintNFT);

router.post("/all", getAllNFT);

router.post("/collection", getNFTofCollection);

router.post("/own", getOwnNFT);

module.exports = router;