const express = require('express');
const router = express.Router();

const saveCollection = require("../controllers/collectionController");

router("/create", saveCollection)

module.exports = router;