// Document route.
// GET /api/documents — lists all uploaded documents for the authenticated user.

const { Router } = require("express");
const { documentController } = require("../controllers/document.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

router.get("/", authMiddleware, documentController.list);

module.exports = router;
