const express = require("express");
const { createCollection, getAllCollection, getOwnerCollection } = require("../controllers/collectionController");

const router = express.Router();

router.post("/create", createCollection);
router.post("/", getAllCollection);
router.post("/owner", getOwnerCollection);

module.exports = router;