// OpenAI embedding client.
// Generates vector embeddings for text using the configured OpenAI embedding model.

const config = require("../../config");
const { getClient } = require("../llm/openai");

const generate = async (text) => {
  const openai = getClient();

  const response = await openai.embeddings.create({
    model: config.openai.embeddingModel,
    input: text,
  });

  return response.data[0].embedding;
};

const generateBatch = async (texts) => {
  const openai = getClient();

  const response = await openai.embeddings.create({
    model: config.openai.embeddingModel,
    input: texts,
  });

  return response.data.map((item) => item.embedding);
};

module.exports = { generate, generateBatch };
