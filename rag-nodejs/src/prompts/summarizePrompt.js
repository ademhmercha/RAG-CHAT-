// Summarization prompt.
// Instructs the LLM to produce a concise summary of the given text.

const buildSummarizePrompt = (text) => {
  return `
Please summarize the following text in a clear and concise way. Capture all key points.

Text:
${text}

Summary:`;
};

module.exports = { buildSummarizePrompt };
