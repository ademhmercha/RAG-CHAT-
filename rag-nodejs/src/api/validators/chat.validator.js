// Chat request validation schema.
// Ensures the question field is present and is a non-empty string.

const chatSchema = {
  question: { type: "string", required: true, min: 1, max: 4000 },
  conversationId: { type: "string", required: false },
};

const validateChat = (body) => {
  const errors = [];
  if (!body.question || typeof body.question !== "string" || body.question.trim().length === 0) {
    errors.push("question is required and must be a non-empty string");
  }
  if (body.question && body.question.length > 4000) {
    errors.push("question must not exceed 4000 characters");
  }
  return errors;
};

module.exports = { chatSchema, validateChat };
