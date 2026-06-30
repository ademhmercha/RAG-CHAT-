// Chat controller.
// Receives a question from the user and delegates to the RAG service.

const ragService = require("../../services/rag.service");
const AuditLog = require("../../models/AuditLog");

const chatController = {
  async ask(req, res, next) {
    try {
      const { question, conversationId, provider, model, apiKey } = req.body;
      const userId = req.user.id;
      const llmOptions = { provider, model, apiKey, userId };

      const result = await ragService.answer(question, userId, conversationId, llmOptions);

      AuditLog.create({ userId, action: "chat", details: `Q: ${question?.slice(0, 200)}`, ip: req.ip }).catch(() => {});

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async askStream(req, res, next) {
    try {
      const { question, conversationId, provider, model, apiKey } = req.body;
      const userId = req.user.id;
      const llmOptions = { provider, model, apiKey, userId };

      AuditLog.create({ userId, action: "chat", details: `Q: ${question?.slice(0, 200)}`, ip: req.ip }).catch(() => {});

      res.json({ success: true, message: "Streaming started" });

      ragService.answerStream(question, userId, conversationId, llmOptions).catch((err) => {
        const { emitToUser } = require("../../sockets/socket");
        emitToUser(userId, "chat:error", { message: err.message || "Streaming failed", conversationId });
      });
    } catch (err) {
      const { emitToUser } = require("../../sockets/socket");
      emitToUser(req.user?.id, "chat:error", { message: err.message || "Failed to start stream", conversationId });
    }
  },
};

module.exports = { chatController };
