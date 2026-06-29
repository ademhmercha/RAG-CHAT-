const axios = require("axios");
const config = require("../../config");

const getConfig = () => ({
  host: process.env.OLLAMA_HOST || config.ollama?.host || "http://ollama:11434",
  embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || config.ollama?.embeddingModel || "nomic-embed-text",
});

const generateBatch = async (texts, concurrency = 10) => {
  if (!texts.length) return [];
  const { host, embeddingModel } = getConfig();
  const results = [];
  for (let i = 0; i < texts.length; i += concurrency) {
    const batch = texts.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((text) =>
      axios.post(`${host}/api/embed`, {
        model: embeddingModel,
        input: [text],
      }, { timeout: 600000 }).then(r => r.data.embeddings[0])
    ));
    results.push(...batchResults);
  }
  return results;
};

const generate = async (text) => {
  const embeddings = await generateBatch([text]);
  return embeddings[0];
};

module.exports = { generate, generateBatch };
