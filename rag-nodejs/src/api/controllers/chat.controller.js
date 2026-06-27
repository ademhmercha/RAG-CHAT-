// Chat controller.
// Receives a question from the user and delegates to the RAG service.

const { ragService } = require("../../services/rag.service");

const chatController = {
  async ask(req, res, next) {
    try {
      const { question, conversationId } = req.body;
      const userId = req.user.id;

      const result = await ragService.answer(question, userId, conversationId);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { chatController };
