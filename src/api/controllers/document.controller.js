const documentService = require("../../services/document.service");

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

  async remove(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await documentService.remove(req.params.id, userId);

      if (!result) {
        return res.status(404).json({ success: false, message: "Document not found" });
      }

      res.json({ success: true, message: "Document deleted" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { documentController };
