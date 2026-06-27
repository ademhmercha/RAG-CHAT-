// Upload service.
// Handles file persistence, database record creation, and triggers the ingestion pipeline.

const path = require("path");
const fs = require("fs");
const documentRepository = require("../repositories/document.repository");
const { loadFromFile } = require("../ingestion/loader");
const { clean } = require("../preprocessing/cleaner");
const { normalize } = require("../preprocessing/normalize");
const { chunk } = require("../chunking/chunker");
const { generateEmbeddings } = require("../embeddings/embedder");
const vectorStore = require("../vectordb/vectorStore");
const { info } = require("../utils/logger");

const processUpload = async (file, userId) => {
  info(`Processing upload: ${file.originalname} for user ${userId}`);

  const docRecord = await documentRepository.create({
    userId,
    filename: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    status: "processing",
  });

  try {
    const rawText = await loadFromFile(file.path, file.mimetype);
    const cleaned = clean(rawText);
    const normalized = normalize(cleaned);
    const chunks = chunk(normalized, "recursive", { maxLength: 1000, overlap: 200 });

    const embeddings = await generateEmbeddings(chunks);
    const ids = chunks.map((_, i) => `${docRecord._id}-chunk-${i}`);
    const metadatas = chunks.map((_, i) => ({
      documentId: docRecord._id.toString(),
      userId: userId.toString(),
      chunkIndex: i,
      filename: file.originalname,
    }));

    await vectorStore.store(ids, embeddings, metadatas, chunks);

    docRecord.status = "completed";
    docRecord.chunkCount = chunks.length;
    await docRecord.save();

    info(`Document ${docRecord._id} ingested with ${chunks.length} chunks`);
  } catch (err) {
    docRecord.status = "failed";
    docRecord.error = err.message;
    await docRecord.save();
    throw err;
  }

  return docRecord;
};

module.exports = { processUpload };
