const Collection = require('./models/Collection');

async function saveCollection(data) {
    const newCollection = new Collection({
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        banner: data.banner,
        metadataURI: data.metadataURI,
        contractAddress: data.contractAddress,
        creator: data.creator
    });

    await newCollection.save();
    console.log("Collection saved successfully!");
}
