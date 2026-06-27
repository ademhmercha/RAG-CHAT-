// Simple tokenizer utility.
// Estimates token count and truncates text to fit within a token budget.
// Uses a rough heuristic: ~4 characters per token for English text.

const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

const truncateByTokens = (text, maxTokens) => {
  if (!text) return "";
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
};

module.exports = { estimateTokens, truncateByTokens };
