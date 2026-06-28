const axios = require("axios");
const config = require("../../config");

const getConfig = () => ({
  host: process.env.OLLAMA_HOST || config.ollama?.host || "http://ollama:11434",
  embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || config.ollama?.embeddingModel || "nomic-embed-text",
});

const generate = async (text) => {
  const { host, embeddingModel } = getConfig();
  const response = await axios.post(`${host}/api/embeddings`, {
    model: embeddingModel,
    prompt: text,
  }, { timeout: 120000 });
  return response.data.embedding;
};

const generateBatch = async (texts) => {
  return Promise.all(texts.map((text) => generate(text)));
};

module.exports = { generate, generateBatch };
