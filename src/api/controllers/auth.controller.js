const jwt = require("jsonwebtoken");
const config = require("../../../config");
const User = require("../../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered" });
      }

      const user = await User.create({ name, email, password });
      const token = signToken(user);

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: { token, user: user.toJSON() },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const token = signToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: { token, user: user.toJSON() },
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, data: user.toJSON() });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { authController };
