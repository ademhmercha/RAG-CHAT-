const ollamaEmbedding = require("./ollamaEmbedding");

const generateEmbedding = async (text) => {
  return ollamaEmbedding.generate(text);
};

const generateEmbeddings = async (texts) => {
  return ollamaEmbedding.generateBatch(texts);
};

module.exports = { generateEmbedding, generateEmbeddings };
