const express = require("express");
const { mintNFT, getAllNFT, getNFTofCollection } = require("../controllers/nftController");

const router = express.Router();

router.post("/mint", mintNFT);

router.post("/all", getAllNFT);

router.post("/collection", getNFTofCollection);

module.exports = router;