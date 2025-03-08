const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const collectionRoutes = require("./routes/collection");

app.use("/api/collection", collectionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

// Export app for use in server.js
module.exports = app;
