// Conversation store.
// Loads and persists conversation history to/from MongoDB via the Conversation model.

const Conversation = require("../models/Conversation");

const findOrCreate = async (conversationId, userId) => {
  if (conversationId) {
    const existing = await Conversation.findById(conversationId);
    if (existing) return existing;
  }

  const conversation = new Conversation({
    userId,
    messages: [],
  });

  return conversation.save();
};

const addMessage = async (conversationId, role, content) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  conversation.messages.push({ role, content, timestamp: new Date() });
  return conversation.save();
};

const getMessages = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return [];
  return conversation.messages;
};

module.exports = { findOrCreate, addMessage, getMessages };
