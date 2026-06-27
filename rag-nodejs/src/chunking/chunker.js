// Chunker dispatcher.
// Selects and applies the appropriate chunking strategy based on configuration.

const recursiveChunker = require("./recursiveChunker");
const semanticChunker = require("./semanticChunker");

const STRATEGIES = {
  recursive: recursiveChunker,
  semantic: semanticChunker,
};

const chunk = (text, strategy = "recursive", options = {}) => {
  const chunker = STRATEGIES[strategy];
  if (!chunker) {
    throw new Error(`Unknown chunking strategy: ${strategy}`);
  }
  return chunker.chunk(text, options);
};

module.exports = { chunk };
