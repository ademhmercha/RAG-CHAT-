// Vector store dispatcher.
// Provides a unified interface for storing and querying vectors.
// Currently delegates to ChromaDB.

const chroma = require("./chroma");

const store = async (ids, embeddings, metadatas, texts) => {
  return chroma.addDocuments(ids, embeddings, metadatas, texts);
};

const search = async (queryEmbedding, topK = 5) => {
  return chroma.query(queryEmbedding, topK);
};

const deleteByDocumentId = async (documentId) => {
  return chroma.deleteByDocumentId(documentId);
};

const deleteCollection = async () => {
  return chroma.deleteCollection();
};

module.exports = { store, search, deleteByDocumentId, deleteCollection };
