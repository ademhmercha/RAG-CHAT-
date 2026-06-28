const { Router } = require("express");
const { documentController } = require("../controllers/document.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

router.get("/", authMiddleware, documentController.list);
router.delete("/:id", authMiddleware, documentController.remove);

module.exports = router;
