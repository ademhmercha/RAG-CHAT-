const path = require("path");
const fs = require("fs");
const documentRepository = require("../repositories/document.repository");
const { loadFromFile } = require("../ingestion/loader");
const { clean } = require("../preprocessing/cleaner");
const { normalize } = require("../preprocessing/normalize");
const { chunk } = require("../chunking/chunker");
const { generateEmbeddings } = require("../embeddings/embedder");
const vectorStore = require("../vectordb/vectorStore");
const { info, error } = require("../utils/logger");

const processInBackground = async (docRecord, filePath, originalname) => {
  try {
    docRecord.status = "processing";
    await docRecord.save();

    const rawText = await loadFromFile(filePath, docRecord.mimeType);
    const cleaned = clean(rawText);
    const normalized = normalize(cleaned);
    const textChunks = chunk(normalized, "recursive", { maxLength: 1000, overlap: 200 });

    const embeddings = await generateEmbeddings(textChunks);
    const ids = textChunks.map((_, i) => `${docRecord._id}-chunk-${i}`);
    const metadatas = textChunks.map((_, i) => ({
      documentId: docRecord._id.toString(),
      userId: docRecord.userId.toString(),
      chunkIndex: i,
      filename: originalname,
    }));

    await vectorStore.store(ids, embeddings, metadatas, textChunks);

    docRecord.status = "completed";
    docRecord.chunkCount = textChunks.length;
    await docRecord.save();

    info(`Document ${docRecord._id} ingested with ${textChunks.length} chunks`);
  } catch (err) {
    error(`Document ${docRecord._id} ingestion failed: ${err.message}`);
    docRecord.status = "failed";
    docRecord.error = err.message;
    await docRecord.save();
  } finally {
    fs.unlink(filePath, () => {});
  }
};

const processUpload = async (file, userId) => {
  info(`Upload queued: ${file.originalname} for user ${userId}`);

  const docRecord = await documentRepository.create({
    userId,
    filename: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    status: "pending",
  });

  processInBackground(docRecord, file.path, file.originalname);

  return docRecord;
};

module.exports = { processUpload };
