// Upload controller.
// Handles file upload and triggers the ingestion pipeline.

const uploadService = require("../../services/upload.service");

const uploadController = {
  async upload(req, res, next) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file provided" });
      }

      const document = await uploadService.processUpload(file, userId);

      res.status(201).json({
        success: true,
        message: "File uploaded and ingestion started",
        data: document,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { uploadController };
