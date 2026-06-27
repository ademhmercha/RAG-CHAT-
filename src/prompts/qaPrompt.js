// Direct Q&A prompt.
// A simple question-answering prompt without retrieved context.

const buildQaPrompt = (question) => {
  return `
Question: ${question}

Please provide a detailed and accurate answer.`;
};

module.exports = { buildQaPrompt };
