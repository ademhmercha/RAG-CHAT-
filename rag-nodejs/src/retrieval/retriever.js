// Retriever pipeline.
// Orchestrates the retrieval process: generate query embedding → similarity search → re-rank.

const similaritySearch = require("./similaritySearch");
const reranker = require("./reranker");
const embedder = require("../embeddings/embedder");

const retrieve = async (question, topK = 5) => {
  const queryEmbedding = await embedder.generateEmbedding(question);
  const results = await similaritySearch.search(queryEmbedding, topK * 2);
  const reranked = reranker.rerank(question, results, topK);

  return reranked;
};

module.exports = { retrieve };
