// Text normalizer.
// Converts text to a consistent case, unicode normalization form, and strips leading/trailing noise.

const normalize = (text) => {
  if (!text) return "";

  let result = text.normalize("NFC");
  result = result.replace(/\u00A0/g, " ");
  result = result.replace(/[\u2013\u2014]/g, "-");
  result = result.replace(/[\u2018\u2019]/g, "'");
  result = result.replace(/[\u201C\u201D]/g, '"');
  result = result.replace(/\u2026/g, "...");
  result = result.trim();

  return result;
};

module.exports = { normalize };
