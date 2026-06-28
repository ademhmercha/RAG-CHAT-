// Application entry point.
// Loads environment, connects to MongoDB, starts the HTTP + Socket.IO server.

const http = require("http");
const mongoose = require("mongoose");
const config = require("./config");
const app = require("./src/app");
const { info, error } = require("./src/utils/logger");
const databaseConfig = require("./config/database");
const { init: initOllama } = require("./src/llm/initOllama");

const server = http.createServer(app);

const { initSocket } = require("./src/sockets/socket");
initSocket(server);

mongoose
  .connect(databaseConfig.uri, databaseConfig.options)
  .then(() => {
    info("Connected to MongoDB");
    server.listen(config.port, () => {
      info(`Server running on port ${config.port} [${config.env}]`);
      initOllama();
    });
  })
  .catch((err) => {
    error("MongoDB connection failed", err);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  error("Unhandled Rejection", reason);
});

process.on("uncaughtException", (err) => {
  error("Uncaught Exception", err);
  process.exit(1);
});

module.exports = server;
