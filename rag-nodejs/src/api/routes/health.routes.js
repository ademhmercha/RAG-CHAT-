// Health check route.
// Returns server status, uptime, and environment info.

const { Router } = require("express");
const mongoose = require("mongoose");

const router = Router();

router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.json({
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus[dbState] || "unknown",
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
