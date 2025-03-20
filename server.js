const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Connect db
connectDB();

// CORS Configuration
const corsOptions = {
    origin: [
        // "http://localhost:4000"
        "http://172.86.66.70:4000"
    ],
    // origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  // Allow sending cookies and Authorization headers
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Server static file - avatar
app.use("/public/avatars", express.static(path.resolve(__dirname, "public", "avatars")));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React build folder
    app.use(express.static(path.join(__dirname, "build")));

    // If any route is not an API route, serve the React index.html
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    });
}

// Import routes
const collectionRoutes = require("./routes/collection");
const nftRoutes = require("./routes/nft");
const metaDataRoutes = require("./routes/metaData");
const userRoutes = require("./routes/user");

app.use("/api/collection", collectionRoutes);
app.use("/api/nft", nftRoutes);
app.use("/api/metaData", metaDataRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on PORT ${PORT}`)
})

// app.listen(PORT, () => {
//     console.log(`Server is running on PORT ${PORT}`)
// })

// Export app for use in server.js
module.exports = app;
