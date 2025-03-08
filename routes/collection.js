const express = require("express");
const { createCollection, getAllCollection } = require("../controllers/collectionController");

const router = express.Router();

router.post("/create", createCollection);
router.post("/", getAllCollection);

module.exports = router;