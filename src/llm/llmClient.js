const ollama = require("./ollama");

const generateResponse = async (messages, options = {}) => {
  return ollama.complete(messages, options);
};

const generateResponseStream = async (messages, options = {}, onToken) => {
  return ollama.completeStream(messages, options, onToken);
};

module.exports = { generateResponse, generateResponseStream };
