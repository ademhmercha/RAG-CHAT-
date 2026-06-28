const documentRepository = require("../repositories/document.repository");
const vectorStore = require("../vectordb/vectorStore");
const fs = require("fs");
const { info } = require("../utils/logger");

const listByUser = async (userId) => {
  return documentRepository.findByUserId(userId);
};

const getById = async (documentId, userId) => {
  return documentRepository.findByIdAndUser(documentId, userId);
};

const remove = async (documentId, userId) => {
  const doc = await documentRepository.findByIdAndUser(documentId, userId);
  if (!doc) return null;

  if (doc.filePath) {
    fs.unlink(doc.filePath, () => {});
  }

  vectorStore.deleteByDocumentId(documentId).catch(() => {});

  await documentRepository.deleteById(documentId, userId);

  info(`Document ${documentId} deleted by user ${userId}`);
  return true;
};

module.exports = { listByUser, getById, remove };
