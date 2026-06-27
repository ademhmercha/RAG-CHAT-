// Document controller.
// Returns a list of documents belonging to the authenticated user.

const { documentService } = require("../../services/document.service");

const documentController = {
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      const documents = await documentService.listByUser(userId);

      res.json({
        success: true,
        data: documents,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { documentController };
