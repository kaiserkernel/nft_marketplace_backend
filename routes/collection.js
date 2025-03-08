const express = require('express');
const router = express.Router();
const { saveCollection, getAllCollection } = require("../controllers/collectionController");

router.post("/create", saveCollection);
router.post("/", getAllCollection);

module.exports = router;