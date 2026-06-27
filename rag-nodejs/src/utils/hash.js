// Hashing utilities.
// Provides SHA-256 hashing for content deduplication and integrity checks.

const crypto = require("crypto");

const sha256 = (content) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

const md5 = (content) => {
  return crypto.createHash("md5").update(content).digest("hex");
};

module.exports = { sha256, md5 };
