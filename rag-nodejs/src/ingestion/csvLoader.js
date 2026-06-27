// CSV text extractor.
// Parses a CSV file and concatenates all fields into a single text block.

const fs = require("fs");
const { parse } = require("csv-parse/sync");

const extract = async (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const records = parse(raw, { columns: false, skip_empty_lines: true });

  const lines = records.map((row) => row.join(" "));
  return lines.join("\n");
};

module.exports = { extract };
