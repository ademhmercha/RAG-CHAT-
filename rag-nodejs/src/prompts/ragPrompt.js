// RAG prompt builder.
// Constructs the full prompt by inserting retrieved context chunks and the user question.

const buildRagPrompt = (contextChunks, question) => {
  const context = contextChunks
    .map((chunk, i) => `[${i + 1}] ${chunk.text}`)
    .join("\n\n");

  return `
Use the following context to answer the question at the end.

Context:
${context}

Question: ${question}

Answer based on the context above. If the context does not contain the answer, say so.`;
};

module.exports = { buildRagPrompt };
