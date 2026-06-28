const axios = require("axios");
const config = require("../../config");

const getConfig = () => ({
  host: process.env.OLLAMA_HOST || config.ollama?.host || "http://ollama:11434",
  model: process.env.OLLAMA_MODEL || config.ollama?.model || "llama3.2",
});

const complete = async (messages, options = {}) => {
  const { host, model } = getConfig();
  const response = await axios.post(`${host}/api/chat`, {
    model: options.model || model,
    messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens || 2048,
    },
  }, { timeout: 600000 });
  return response.data.message.content;
};

module.exports = { complete };
