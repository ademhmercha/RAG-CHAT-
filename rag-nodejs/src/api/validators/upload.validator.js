// Upload request validation.
// Checks that a file is present in the request and has an allowed MIME type.

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/html",
  "text/markdown",
];

const uploadSchema = {
  file: { type: "file", required: true },
};

const validateUpload = (body, file) => {
  const errors = [];
  if (!file) {
    errors.push("file is required");
  } else if (!ALLOWED_MIMES.includes(file.mimetype)) {
    errors.push(`file type ${file.mimetype} is not allowed`);
  }
  return errors;
};

module.exports = { uploadSchema, validateUpload, ALLOWED_MIMES };
