// Rate limiting middleware.
// Restricts the number of requests a client can make within a time window.

const rateLimit = require("express-rate-limit");
const { AppError } = require("../exceptions/AppError");

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    handler: (req, res) => {
      throw new AppError("Too many requests, please try again later", 429);
    },
  });
};

const chatRateLimiter = createRateLimiter(60 * 1000, 20);

module.exports = { createRateLimiter, chatRateLimiter };
