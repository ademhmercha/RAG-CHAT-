// HTML text extractor.
// Strips HTML tags and returns plain text content.

const fs = require("fs");

const extract = async (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return text;
};

module.exports = { extract };
