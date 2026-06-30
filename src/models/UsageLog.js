const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    tokensIn: { type: Number, default: 0 },
    tokensOut: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    endpoint: { type: String, default: "" },
    success: { type: Boolean, default: true },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

usageLogSchema.index({ createdAt: -1 });
usageLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("UsageLog", usageLogSchema);
