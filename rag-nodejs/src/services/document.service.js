// Document service.
// Handles business logic for listing, retrieving, and managing documents.

const documentRepository = require("../repositories/document.repository");

const listByUser = async (userId) => {
  return documentRepository.findByUserId(userId);
};

const getById = async (documentId, userId) => {
  return documentRepository.findByIdAndUser(documentId, userId);
};

const remove = async (documentId, userId) => {
  return documentRepository.deleteById(documentId, userId);
};

module.exports = { listByUser, getById, remove };
