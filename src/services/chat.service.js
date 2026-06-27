// Chat service.
// Provides direct (non-RAG) chat capabilities — sends a message to the LLM
// and returns the response without context retrieval.

const { getSystemPrompt } = require("../prompts/systemPrompt");
const { generateResponse } = require("../llm/llmClient");

const sendMessage = async (message, history = []) => {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  const response = await generateResponse(messages);
  return response;
};

module.exports = { sendMessage };
