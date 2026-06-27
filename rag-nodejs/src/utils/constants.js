// Application-wide constants.

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/html",
];

const DOCUMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const CHUNK_DEFAULTS = {
  MAX_LENGTH: 1000,
  OVERLAP: 200,
};

const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

module.exports = { ALLOWED_MIME_TYPES, DOCUMENT_STATUS, CHUNK_DEFAULTS, USER_ROLES };
