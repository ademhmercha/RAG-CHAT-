// PDF text extractor.
// Uses pdftotext (poppler-utils) for fast text extraction, falls back to pdf-parse.

const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const execFileAsync = promisify(execFile);

const extract = async (filePath) => {
  try {
    const { stdout } = await execFileAsync("pdftotext", ["-layout", "-nopgbrk", filePath, "-"], { timeout: 30000 });
    if (stdout.trim()) return stdout;
    throw new Error("pdftotext returned empty text");
  } catch (err) {
    const pdfParse = require("pdf-parse");
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
};

module.exports = { extract };
