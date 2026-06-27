// Winston logger instance.
// Provides application-wide logging with console and file transports.

const winston = require("winston");
const path = require("path");
const loggerConfig = require("../../config/logger");

const logger = winston.createLogger({
  level: loggerConfig.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(loggerConfig.dir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(loggerConfig.dir, "combined.log"),
    }),
  ],
});

const info = (msg, meta = {}) => logger.info(msg, meta);
const warn = (msg, meta = {}) => logger.warn(msg, meta);
const error = (msg, meta = {}) => logger.error(msg, meta);
const debug = (msg, meta = {}) => logger.debug(msg, meta);

module.exports = { logger, info, warn, error, debug };
