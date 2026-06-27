// LLM configuration.
// Centralizes OpenAI model name, token limit, and temperature settings.

const config = require("./index");

const llmConfig = {
  apiKey: config.openai.apiKey,
  model: config.openai.model,
  maxTokens: config.openai.maxTokens,
  temperature: config.openai.temperature,
};

module.exports = llmConfig;
