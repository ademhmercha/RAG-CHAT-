const { Router } = require("express");
const { authMiddleware } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/admin.middleware");
const { adminController } = require("../controllers/admin.controller");

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUser);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/usage", adminController.getUsageLogs);
router.get("/usage/summary", adminController.getUsageSummary);
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);
router.get("/audit", adminController.getAuditLogs);
router.get("/documents", adminController.getAllDocuments);
router.get("/chart/usage", adminController.getChartUsage);
router.get("/chart/users", adminController.getChartUsers);
router.get("/chart/providers", adminController.getChartProviders);
router.get("/chart/daily-audit", adminController.getChartDailyAudit);

module.exports = router;
