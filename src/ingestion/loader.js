// Document loader dispatcher.
// Detects the file type and delegates to the appropriate loader implementation.

const pdfLoader = require("./pdfLoader");
const wordLoader = require("./wordLoader");
const txtLoader = require("./txtLoader");
const csvLoader = require("./csvLoader");
const htmlLoader = require("./htmlLoader");
const urlLoader = require("./urlLoader");
const youtubeLoader = require("./youtubeLoader");
const { AppError } = require("../exceptions/AppError");

const loaders = {
  "application/pdf": pdfLoader,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": wordLoader,
  "text/plain": txtLoader,
  "text/csv": csvLoader,
  "text/html": htmlLoader,
};

const loadFromFile = async (filePath, mimeType) => {
  const loader = loaders[mimeType];
  if (!loader) {
    throw new AppError(`No loader available for type: ${mimeType}`, 400);
  }
  return loader.extract(filePath);
};

const loadFromUrl = async (url) => {
  return urlLoader.extract(url);
};

const loadFromYoutube = async (videoId) => {
  return youtubeLoader.extract(videoId);
};

module.exports = { loadFromFile, loadFromUrl, loadFromYoutube };
