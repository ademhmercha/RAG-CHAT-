// LLM client dispatcher.
// Provides a unified interface for sending prompts to the configured LLM provider.

const openai = require("./openai");

const generateResponse = async (messages, options = {}) => {
  return openai.complete(messages, options);
};

module.exports = { generateResponse };
