const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Connect db
connectDB();

// CORS Configuration
const corsOptions = {
    origin: [
        "http://localhost:3000"
    ],
    // origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  // Allow sending cookies and Authorization headers
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Import routes
const collectionRoutes = require("./routes/collection");
const nftRoutes = require("./routes/nft");
const metaDataRoutes = require("./routes/metaData");

app.use("/api/collection", collectionRoutes);
app.use("/api/nft", nftRoutes);
app.use("/api/metaData", metaDataRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

// Export app for use in server.js
module.exports = app;
