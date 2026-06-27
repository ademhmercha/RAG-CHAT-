// Local filesystem storage.
// Handles file read, write, and deletion operations on the local disk.

const fs = require("fs");
const path = require("path");
const config = require("../../config");

const ensureDir = () => {
  const dir = path.resolve(config.upload.dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const save = async (buffer, filename) => {
  const dir = ensureDir();
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

const remove = async (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getPath = (filename) => {
  const dir = path.resolve(config.upload.dir);
  return path.join(dir, filename);
};

module.exports = { save, remove, getPath };
