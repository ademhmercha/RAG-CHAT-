// RAG prompt builder.
// Constructs the full prompt by inserting retrieved context chunks and the user question.

const buildRagPrompt = (contextChunks, question) => {
  const context = contextChunks
    .map((chunk, i) => {
      const source = chunk.metadata?.filename || chunk.metadata?.source || "Unknown";
      return `[${i + 1}] (Source: ${source}) ${chunk.text}`;
    })
    .join("\n\n");

  return `
Use the following context to answer the question at the end.

Context:
${context}

Question: ${question}

Answer based on the context above. If the context does not contain enough information, say so.`;
};

module.exports = { buildRagPrompt };
