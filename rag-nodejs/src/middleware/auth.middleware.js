// JWT authentication middleware.
// Extracts the Bearer token from the Authorization header, verifies it,
// and attaches the decoded payload to req.user.

const jwt = require("jsonwebtoken");
const config = require("../../config");
const { AppError } = require("../exceptions/AppError");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = { authMiddleware };
