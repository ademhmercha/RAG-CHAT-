// ChromaDB client.
// Manages the connection to ChromaDB, creates collections, adds documents,
// and performs similarity searches.

const { ChromaClient } = require("chromadb");
const config = require("../../config");
const vectordbConfig = require("../../config/vectordb");
const { info, error } = require("../utils/logger");

let client = null;
let collection = null;

const getClient = () => {
  if (!client) {
    client = new ChromaClient({ path: vectordbConfig.url });
  }
  return client;
};

const ensureCollection = async () => {
  const c = getClient();
  try {
    collection = await c.getOrCreateCollection({
      name: vectordbConfig.collection,
    });
    info(`ChromaDB collection "${vectordbConfig.collection}" ready`);
  } catch (err) {
    error("Failed to get/create ChromaDB collection", err);
    throw err;
  }
  return collection;
};

const addDocuments = async (ids, embeddings, metadatas, documents) => {
  const col = await ensureCollection();
  await col.add({
    ids,
    embeddings,
    metadatas,
    documents,
  });
};

const query = async (queryEmbedding, topK = 5) => {
  const col = await ensureCollection();
  const result = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ["documents", "metadatas", "distances"],
  });

  return result;
};

const deleteByDocumentId = async (documentId) => {
  const col = await ensureCollection();
  await col.delete({ where: { documentId } });
  info(`Deleted vectors for document ${documentId}`);
};

const deleteCollection = async () => {
  const c = getClient();
  await c.deleteCollection({ name: vectordbConfig.collection });
  collection = null;
};

module.exports = { ensureCollection, addDocuments, query, deleteByDocumentId, deleteCollection };
