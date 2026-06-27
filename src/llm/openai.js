// OpenAI client wrapper.
// Manages the OpenAI SDK instance and provides completion methods.

const OpenAI = require("openai");
const config = require("../../config");
const llmConfig = require("../../config/llm");

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: llmConfig.apiKey });
  }
  return client;
};

const complete = async (messages, options = {}) => {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: options.model || llmConfig.model,
    messages,
    max_tokens: options.maxTokens || llmConfig.maxTokens,
    temperature: options.temperature ?? llmConfig.temperature,
  });

  return response.choices[0].message.content;
};

module.exports = { getClient, complete };
