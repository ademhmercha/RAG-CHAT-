// Upload controller.
// Handles file upload and triggers the ingestion pipeline.

const uploadService = require("../../services/upload.service");
const AuditLog = require("../../models/AuditLog");

const uploadController = {
  async upload(req, res, next) {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: "No file provided" });
      }

      const document = await uploadService.processUpload(file, userId);

      AuditLog.create({ userId, action: "upload", details: file.originalname, ip: req.ip }).catch(() => {});

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
