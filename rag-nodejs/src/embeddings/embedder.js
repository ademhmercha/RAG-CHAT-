// Embedder dispatcher.
// Delegates embedding generation to the configured provider (OpenAI).

const openaiEmbedding = require("./openaiEmbedding");

const generateEmbedding = async (text) => {
  return openaiEmbedding.generate(text);
};

const generateEmbeddings = async (texts) => {
  return openaiEmbedding.generateBatch(texts);
};

module.exports = { generateEmbedding, generateEmbeddings };
