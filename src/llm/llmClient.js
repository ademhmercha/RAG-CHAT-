const router = require("./llmRouter");

const generateResponse = async (messages, options = {}) => {
  return router.generateResponse(messages, options);
};

const generateResponseStream = async (messages, options = {}, onToken) => {
  return router.generateResponseStream(messages, options, onToken);
};

module.exports = { generateResponse, generateResponseStream };
