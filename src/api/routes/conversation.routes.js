const { Router } = require("express");
const { conversationController } = require("../controllers/conversation.controller");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

router.use(authMiddleware);

router.get("/", conversationController.list);
router.get("/:id", conversationController.getOne);
router.delete("/:id", conversationController.remove);
router.patch("/:id", conversationController.rename);

module.exports = router;
