// RAG service.
// Orchestrates the complete RAG pipeline: retrieve context → build prompt → call LLM → return answer.

const retriever = require("../retrieval/retriever");
const { buildRagPrompt } = require("../prompts/ragPrompt");
const { getSystemPrompt } = require("../prompts/systemPrompt");
const { generateResponse, generateResponseStream } = require("../llm/llmClient");
const conversationStore = require("../memory/conversationStore");
const { emitToUser } = require("../sockets/socket");

const answer = async (question, userId, conversationId, llmOptions = {}) => {
  const conversation = await conversationStore.findOrCreate(conversationId, userId);

  const contextChunks = await retriever.retrieve(question, 5);

  const systemPrompt = getSystemPrompt();
  const userPrompt = buildRagPrompt(contextChunks, question);

  const history = conversation.messages.slice(-10).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userPrompt },
  ];

  const result = await generateResponse(messages, llmOptions);

  await conversationStore.addMessage(conversation._id, "user", question);
  await conversationStore.addMessage(conversation._id, "assistant", result.text);

  return {
    answer: result.text,
    conversationId: conversation._id,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    fallbackOccurred: result.fallbackOccurred,
    sources: contextChunks.map((c) => ({
      text: c.text.slice(0, 200),
      score: c.combinedScore,
      metadata: c.metadata,
      filename: c.metadata?.filename || c.metadata?.source || "Unknown",
    })),
  };
};

const answerStream = async (question, userId, conversationId, llmOptions = {}) => {
  const conversation = await conversationStore.findOrCreate(conversationId, userId);

  const contextChunks = await retriever.retrieve(question, 5);

  const systemPrompt = getSystemPrompt();
  const userPrompt = buildRagPrompt(contextChunks, question);

  const history = conversation.messages.slice(-10).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userPrompt },
  ];

  const sources = contextChunks.map((c) => ({
    text: c.text.slice(0, 200),
    score: c.combinedScore,
    metadata: c.metadata,
    filename: c.metadata?.filename || c.metadata?.source || "Unknown",
  }));

  emitToUser(userId, "chat:start", {
    conversationId: conversation._id,
    sources,
  });

  let fullAnswer = "";

  const result = await generateResponseStream(messages, llmOptions, (token) => {
    fullAnswer += token;
    emitToUser(userId, "chat:token", { token, conversationId: conversation._id });
  });

  if (result.fallbackOccurred) {
    emitToUser(userId, "chat:fallback", {
      conversationId: conversation._id,
      fromProvider: result.attemptedProviders[0] || "unknown",
      toProvider: result.providerUsed,
    });
  }

  await conversationStore.addMessage(conversation._id, "user", question);
  await conversationStore.addMessage(conversation._id, "assistant", fullAnswer);

  emitToUser(userId, "chat:done", {
    conversationId: conversation._id,
    answer: fullAnswer,
    sources,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    fallbackOccurred: result.fallbackOccurred,
  });

  return {
    answer: fullAnswer,
    conversationId: conversation._id,
    providerUsed: result.providerUsed,
    modelUsed: result.modelUsed,
    fallbackOccurred: result.fallbackOccurred,
    sources,
  };
};

module.exports = { answer, answerStream };
