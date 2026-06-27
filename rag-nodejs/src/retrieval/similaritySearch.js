// Similarity search.
// Queries the vector store (ChromaDB) to find the nearest neighbor chunks.

const vectorStore = require("../vectordb/vectorStore");

const search = async (queryEmbedding, topK = 5) => {
  const result = await vectorStore.search(queryEmbedding, topK);

  const items = [];
  if (result.documents && result.documents[0]) {
    for (let i = 0; i < result.documents[0].length; i++) {
      items.push({
        text: result.documents[0][i],
        metadata: result.metadatas[0][i] || {},
        score: result.distances[0][i] || 0,
      });
    }
  }

  return items;
};

module.exports = { search };
