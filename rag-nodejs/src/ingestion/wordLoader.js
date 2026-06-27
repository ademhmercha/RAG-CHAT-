// Word document text extractor.
// Reads a .docx file by treating it as a ZIP archive and extracting the XML body text.
// For production, consider using mammoth or docx4js.

const fs = require("fs");
const path = require("path");
const { AppError } = require("../exceptions/AppError");

const extract = async (filePath) => {
  try {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(filePath);
    const contentXml = zip.readAsText("word/document.xml");

    if (!contentXml) {
      throw new AppError("Invalid docx file: missing word/document.xml", 400);
    }

    const text = contentXml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to extract text from Word document", 500);
  }
};

module.exports = { extract };
