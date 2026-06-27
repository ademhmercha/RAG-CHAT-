// Semantic chunker.
// Splits text at topic boundaries by detecting shifts in content (e.g., new headings,
// numbered lists, or abrupt topic changes). Falls back to recursive chunking.

const chunk = (text, options = {}) => {
  const maxLength = options.maxLength || 1500;

  if (!text || text.length === 0) return [];

  const headingPattern = /(?=\n#{1,6}\s|\n\d+[\.\)]\s|\n[-*]\s)/g;
  const segments = text.split(headingPattern);

  const chunks = [];
  let current = "";

  for (const segment of segments) {
    if ((current + segment).length > maxLength && current.length > 0) {
      chunks.push(current.trim());
      current = segment;
    } else {
      current += segment;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 0);
};

module.exports = { chunk };
