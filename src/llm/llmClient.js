const ollama = require("./ollama");

const generateResponse = async (messages, options = {}) => {
  return ollama.complete(messages, options);
};

module.exports = { generateResponse };
