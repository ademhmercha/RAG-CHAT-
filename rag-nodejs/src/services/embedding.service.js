// Embedding service.
// Wraps embedding generation and provides batch processing utilities.

const { generateEmbedding, generateEmbeddings } = require("../embeddings/embedder");

const createEmbedding = async (text) => {
  return generateEmbedding(text);
};

const createBatchEmbeddings = async (texts) => {
  return generateEmbeddings(texts);
};

module.exports = { createEmbedding, createBatchEmbeddings };
