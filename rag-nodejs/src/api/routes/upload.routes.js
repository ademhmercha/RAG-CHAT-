// Upload route.
// POST /api/upload — uploads a document (PDF, Word, TXT, CSV, etc.) for ingestion.

const { Router } = require("express");
const { uploadController } = require("../controllers/upload.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");
const { uploadMiddleware } = require("../../middleware/upload.middleware");
const { validate } = require("../../middleware/validation.middleware");
const { uploadSchema } = require("../validators/upload.validator");

const router = Router();

router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("file"),
  validate(uploadSchema),
  uploadController.upload
);

module.exports = router;
