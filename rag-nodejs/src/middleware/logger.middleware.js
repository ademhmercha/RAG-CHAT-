// HTTP request logging middleware.
// Logs each incoming request method, URL, and response status via Winston.

const { info } = require("../utils/logger");

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

module.exports = { loggerMiddleware };
