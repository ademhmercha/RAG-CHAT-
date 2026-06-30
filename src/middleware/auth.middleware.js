const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("../models/User");
const { AppError } = require("../exceptions/AppError");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }
    if (user.disabled) {
      return next(new AppError("Account has been disabled", 403));
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = { authMiddleware };
