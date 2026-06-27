// Text cleaner.
// Removes unwanted characters, excessive whitespace, HTML entities,
// and non-printable characters from raw extracted text.

const clean = (text) => {
  if (!text) return "";

  let cleaned = text
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
};

module.exports = { clean };
