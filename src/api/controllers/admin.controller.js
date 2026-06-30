const User = require("../../models/User");
const UsageLog = require("../../models/UsageLog");
const Settings = require("../../models/Settings");
const AuditLog = require("../../models/AuditLog");
const Document = require("../../models/Document");

const adminController = {
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await User.countDocuments(query);
      res.json({
        success: true,
        data: { users, total, page: Number(page), pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, data: user.toJSON() });
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { name, role, disabled } = req.body;
      const update = {};
      if (name !== undefined) update.name = name;
      if (role !== undefined) update.role = role;
      if (disabled !== undefined) update.disabled = disabled;
      const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, data: user.toJSON() });
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, message: "User deleted" });
    } catch (err) {
      next(err);
    }
  },

  async getUsageLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, userId } = req.query;
      const query = {};
      if (userId) query.userId = userId;
      const logs = await UsageLog.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await UsageLog.countDocuments(query);
      res.json({
        success: true,
        data: { logs, total, page: Number(page), pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsageSummary(req, res, next) {
    try {
      const summary = await UsageLog.aggregate([
        {
          $group: {
            _id: { provider: "$provider", model: "$model" },
            count: { $sum: 1 },
            totalTokensIn: { $sum: "$tokensIn" },
            totalTokensOut: { $sum: "$tokensOut" },
            avgDurationMs: { $avg: "$durationMs" },
            failures: { $sum: { $cond: ["$success", 0, 1] } },
          },
        },
        { $sort: { count: -1 } },
      ]);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  },

  async getSettings(req, res, next) {
    try {
      const settings = await Settings.find();
      const map = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      res.json({ success: true, data: map });
    } catch (err) {
      next(err);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const updates = req.body;
      const ops = Object.entries(updates).map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: { $set: { key, value } },
          upsert: true,
        },
      }));
      await Settings.bulkWrite(ops);
      res.json({ success: true, message: "Settings updated" });
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, action } = req.query;
      const query = {};
      if (action) query.action = action;
      const logs = await AuditLog.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await AuditLog.countDocuments(query);
      res.json({
        success: true,
        data: { logs, total, page: Number(page), pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllDocuments(req, res, next) {
    try {
      const { page = 1, limit = 50, userId } = req.query;
      const query = {};
      if (userId) query.userId = userId;
      const docs = await Document.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await Document.countDocuments(query);
      res.json({
        success: true,
        data: { documents: docs, total, page: Number(page), pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  },

  async getDashboardStats(req, res, next) {
    try {
      const Conversation = require("../../models/Conversation");
      const now = new Date();
      const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const [totalUsers, totalAdmins, totalLogs, recentLogs, totalAudit, totalDocs, totalConvs, users24h, docs24h, logs7d] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "admin" }),
        UsageLog.countDocuments(),
        UsageLog.countDocuments({ createdAt: { $gte: dayAgo } }),
        AuditLog.countDocuments(),
        Document.countDocuments(),
        Conversation.countDocuments(),
        User.countDocuments({ createdAt: { $gte: dayAgo } }),
        Document.countDocuments({ createdAt: { $gte: dayAgo } }),
        UsageLog.countDocuments({ createdAt: { $gte: weekAgo } }),
      ]);
      const successRate = totalLogs > 0
        ? ((await UsageLog.countDocuments({ success: true })) / totalLogs * 100).toFixed(1)
        : "0.0";
      res.json({
        success: true,
        data: { totalUsers, totalAdmins, totalLogs, recentLogs, totalAudit, totalDocs, totalConvs, users24h, docs24h, logs7d, successRate },
      });
    } catch (err) {
      next(err);
    }
  },

  async getChartUsage(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const data = await UsageLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: 1 },
            success: { $sum: { $cond: ["$success", 1, 0] } },
            failed: { $sum: { $cond: ["$success", 0, 1] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getChartUsers(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const data = await User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getChartDailyAudit(req, res, next) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const data = await AuditLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            login: { $sum: { $cond: [{ $eq: ["$action", "login"] }, 1, 0] } },
            chat: { $sum: { $cond: [{ $eq: ["$action", "chat"] }, 1, 0] } },
            upload: { $sum: { $cond: [{ $eq: ["$action", "upload"] }, 1, 0] } },
            register: { $sum: { $cond: [{ $eq: ["$action", "register"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getChartProviders(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const data = await UsageLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { adminController };
