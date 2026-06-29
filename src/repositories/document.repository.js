// Document repository.
// Provides data-access methods for the Document model (MongoDB).

const Document = require("../models/Document");

const create = async (data) => {
  const doc = new Document(data);
  return doc.save();
};

const findByUserId = async (userId) => {
  return Document.find({ userId }).sort({ createdAt: -1 }).lean();
};

const findByIdAndUser = async (documentId, userId) => {
  return Document.findOne({ _id: documentId, userId }).lean();
};

const deleteById = async (documentId, userId) => {
  return Document.findOneAndDelete({ _id: documentId, userId });
};

const updateStatus = async (documentId, status, error = null) => {
  const update = { status };
  if (error) update.error = error;
  return Document.findByIdAndUpdate(documentId, update, { new: true });
};

const findPending = async () => {
  return Document.find({ status: "pending" }).sort({ createdAt: 1 });
};

module.exports = { create, findByUserId, findByIdAndUser, deleteById, updateStatus, findPending };
