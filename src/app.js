// Express application setup.
// Registers global middleware, routes, and error handlers.

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const config = require("../config");

const healthRoutes = require("./api/routes/health.routes");
const authRoutes = require("./api/routes/auth.routes");
const chatRoutes = require("./api/routes/chat.routes");
const uploadRoutes = require("./api/routes/upload.routes");
const documentRoutes = require("./api/routes/document.routes");
const conversationRoutes = require("./api/routes/conversation.routes");

const { errorMiddleware } = require("./middleware/error.middleware");
const { loggerMiddleware } = require("./middleware/logger.middleware");

const app = express();

// --- Security ---
app.use(helmet());

// --- CORS ---
app.use(cors({ origin: config.cors.origin }));

// --- Request logging ---
app.use(morgan("combined", { stream: { write: (msg) => require("./utils/logger").info(msg.trim()) } }));
app.use(loggerMiddleware);

// --- Body parsing ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);

// --- Central error handler ---
app.use(errorMiddleware);

module.exports = app;
