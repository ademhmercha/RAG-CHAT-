// Vector database configuration.
// Exports ChromaDB host, port, collection name, and full URL.

const config = require("./index");

const vectordbConfig = {
  url: config.chroma.url,
  collection: config.chroma.collection,
};

module.exports = vectordbConfig;
