const express = require("express");
const { getMetaData } = require("../controllers/metaDataController");

const router = express.Router();

router.post("/", getMetaData);

module.exports = router;