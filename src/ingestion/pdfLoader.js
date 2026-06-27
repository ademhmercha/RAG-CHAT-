// PDF text extractor.
// Uses pdf-parse to extract textual content from PDF files.

const fs = require("fs");
const pdfParse = require("pdf-parse");

const extract = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};

module.exports = { extract };
