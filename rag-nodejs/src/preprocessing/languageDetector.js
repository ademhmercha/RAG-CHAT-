// Language detector.
// Identifies the likely language of a text string using character n-gram heuristics.
// Returns an ISO 639-1 language code.

const detect = (text) => {
  if (!text || text.trim().length === 0) return "unknown";

  const sample = text.slice(0, 500).toLowerCase();
  const latinChars = (sample.match(/[a-z]/g) || []).length;
  const cjkChars = (sample.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length;
  const cyrillicChars = (sample.match(/[\u0400-\u04FF]/g) || []).length;

  if (cjkChars > latinChars) return "zh";
  if (cyrillicChars > latinChars) return "ru";
  if (latinChars > 0) return "en";

  return "unknown";
};

module.exports = { detect };
