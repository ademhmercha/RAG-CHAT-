const axios = require("axios");
const config = require("../../config");
const { info } = require("../utils/logger");

const OLLAMA_HOST = config.ollama?.host || process.env.OLLAMA_HOST || "http://ollama:11434";

const pullModel = async (model) => {
  try {
    info(`Pulling Ollama model: ${model}...`);
    const response = await axios.post(`${OLLAMA_HOST}/api/pull`, { name: model }, { timeout: 600000 });
    info(`Model ${model} ready`);
    return true;
  } catch (err) {
    info(`Failed to pull model ${model}: ${err.message}`);
    return false;
  }
};

const init = async () => {
  info("Initializing Ollama models...");
  await pullModel(config.ollama.model);
  await pullModel(config.ollama.embeddingModel);
  info("Ollama initialization complete");
};

module.exports = { init };
