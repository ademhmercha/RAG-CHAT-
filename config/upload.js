// Upload configuration.
// Defines the upload directory path and maximum allowed file size in bytes.

const config = require("./index");

const uploadConfig = {
  dir: config.upload.dir,
  maxFileSize: config.upload.maxFileSize,
};

module.exports = uploadConfig;
