// File system utilities.
// Provides helpers for reading, writing, and inspecting files.

const fs = require("fs");
const path = require("path");

const readFile = (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf-8");
};

const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const getFileSize = (filePath) => {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
};

module.exports = { readFile, writeFile, fileExists, getFileSize };
