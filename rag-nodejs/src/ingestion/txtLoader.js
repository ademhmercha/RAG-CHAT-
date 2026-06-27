// Plain text loader.
// Reads a .txt file and returns its content as a string.

const fs = require("fs");

const extract = async (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

module.exports = { extract };
