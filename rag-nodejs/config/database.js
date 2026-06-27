// Database configuration.
// Provides the MongoDB connection URI and Mongoose options.

const config = require("./index");

const databaseConfig = {
  uri: config.mongodb.uri,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

module.exports = databaseConfig;
