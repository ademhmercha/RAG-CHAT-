// Recursive character text splitter.
// Splits text recursively on paragraph, sentence, and word boundaries
// to produce chunks that fit within a target token limit.

const chunk = (text, options = {}) => {
  const maxLength = options.maxLength || 1000;
  const overlap = options.overlap || 200;

  if (!text || text.length === 0) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;

    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    const boundary = text.lastIndexOf("\n\n", end);
    const boundary2 = text.lastIndexOf("\n", end);
    const boundary3 = text.lastIndexOf(". ", end);
    const boundary4 = text.lastIndexOf(" ", end);

    let splitAt = end;
    if (boundary > start && boundary < end) splitAt = boundary + 1;
    else if (boundary2 > start && boundary2 < end) splitAt = boundary2 + 1;
    else if (boundary3 > start && boundary3 < end) splitAt = boundary3 + 2;
    else if (boundary4 > start && boundary4 < end) splitAt = boundary4 + 1;

    chunks.push(text.slice(start, splitAt).trim());
    start = splitAt - overlap;
    if (start < 0) start = 0;
  }

  return chunks.filter((c) => c.length > 0);
};

module.exports = { chunk };
