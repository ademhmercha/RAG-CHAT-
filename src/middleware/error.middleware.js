// Centralized error handling middleware.
// Catches all errors thrown in route handlers and returns a consistent JSON response.

const { AppError } = require("../exceptions/AppError");
const { error } = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  error(err.message, { stack: err.stack, path: req.originalUrl });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = { errorMiddleware };
