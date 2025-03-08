const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const pinataApiKey = "your-pinata-api-key";
const pinataSecretApiKey = "your-pinata-secret-api-key";

async function uploadToIPFS(filePath) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const options = JSON.stringify({ cidVersion: 0 });
    formData.append("pinataOptions", options);

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                "pinata_api_key": pinataApiKey,
                "pinata_secret_api_key": pinataSecretApiKey
            }
        });
        console.log("IPFS URL:", `ipfs://${res.data.IpfsHash}`);
        return `ipfs://${res.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading file to IPFS:", error);
    }
}

// Example usage
uploadToIPFS("avatar.png");
