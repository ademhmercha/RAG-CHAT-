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

const completeStream = async (messages, options = {}, onToken) => {
  const { host, model } = getConfig();
  const response = await axios.post(`${host}/api/chat`, {
    model: options.model || model,
    messages,
    stream: true,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens || 2048,
    },
  }, {
    responseType: "stream",
    timeout: 600000,
  });

  return new Promise((resolve, reject) => {
    const stream = response.data;
    let buffer = "";
    let fullContent = "";

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullContent += parsed.message.content;
            onToken(parsed.message.content);
          }
          if (parsed.done) {
            resolve(fullContent);
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    });

    stream.on("error", reject);
    stream.on("end", () => resolve(fullContent));
  });
};

module.exports = { complete, completeStream };
