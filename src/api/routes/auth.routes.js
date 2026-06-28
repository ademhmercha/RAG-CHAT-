const { Router } = require("express");
const { authController } = require("../controllers/auth.controller");
const { validate } = require("../../middleware/validation.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { authMiddleware } = require("../../middleware/auth.middleware");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
