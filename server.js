require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const collectionRoutes = require("./routes/collection");
app.use("/api/collection", collectionRoutes);

// Export app for use in server.js
module.exports = app;
