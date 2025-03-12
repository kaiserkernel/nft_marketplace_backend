const { default: axios } = require("axios");

// Create and save a new collection
const getMetaData = async (req, res) => {
  try {
    const {uri} = req.body;
    const {data} = await axios.get(uri);
    res.status(200).json({message: "Collection metadata fetched successfully", data});
  } catch (error) {
    console.log(error, 'error')
    res.status(500).json({ message: "Failed to fetch meta data of collection", msg: [error.message] });
  }
}

module.exports = { getMetaData };
