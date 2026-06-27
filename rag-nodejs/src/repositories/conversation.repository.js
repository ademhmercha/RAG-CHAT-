// Conversation repository.
// Provides data-access methods for the Conversation model (MongoDB).

const Conversation = require("../models/Conversation");

const create = async (userId) => {
  const conversation = new Conversation({ userId, messages: [] });
  return conversation.save();
};

const findById = async (conversationId) => {
  return Conversation.findById(conversationId);
};

const findByUserId = async (userId) => {
  return Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
};

const pushMessage = async (conversationId, role, content) => {
  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      $push: { messages: { role, content, timestamp: new Date() } },
    },
    { new: true }
  );
};

module.exports = { create, findById, findByUserId, pushMessage };
