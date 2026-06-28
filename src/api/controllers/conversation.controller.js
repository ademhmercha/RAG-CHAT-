const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");

const conversationController = {
  async list(req, res, next) {
    try {
      const conversations = await Conversation.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        { $sort: { updatedAt: -1 } },
        { $addFields: { messageCount: { $size: "$messages" } } },
        { $project: { title: 1, createdAt: 1, updatedAt: 1, messageCount: 1 } },
      ]);

      res.json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      res.json({ success: true, data: conversation });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const conversation = await Conversation.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      res.json({ success: true, message: "Conversation deleted" });
    } catch (err) {
      next(err);
    }
  },

  async rename(req, res, next) {
    try {
      const { title } = req.body;
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Title is required" });
      }

      const conversation = await Conversation.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { title: title.trim() },
        { new: true }
      );

      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      res.json({ success: true, data: conversation });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { conversationController };
