// MongoDB connection setup.
// Establishes and manages the Mongoose connection lifecycle.

const mongoose = require("mongoose");
const databaseConfig = require("../../config/database");
const { info, error } = require("../utils/logger");

const connect = async () => {
  try {
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    info("MongoDB connected successfully");
  } catch (err) {
    error("MongoDB connection error", err);
    throw err;
  }
};

const disconnect = async () => {
  await mongoose.disconnect();
  info("MongoDB disconnected");
};

module.exports = { connect, disconnect };
