const express = require("express");
const { createCollection, getAllCollection, getOwnerCollection, getMetadata } = require("../controllers/collectionController");

const router = express.Router();

router.post("/create", createCollection);
router.post("/", getAllCollection);
router.post("/owner", getOwnerCollection);
router.post("/metadata", getMetadata)

module.exports = router;