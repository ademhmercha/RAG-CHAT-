const registerSchema = {
  validate(body) {
    const errors = [];
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      errors.push("name is required");
    }
    if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      errors.push("valid email is required");
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
      errors.push("password must be at least 6 characters");
    }
    return errors;
  },
};

const loginSchema = {
  validate(body) {
    const errors = [];
    if (!body.email || typeof body.email !== "string") {
      errors.push("email is required");
    }
    if (!body.password || typeof body.password !== "string") {
      errors.push("password is required");
    }
    return errors;
  },
};

module.exports = { registerSchema, loginSchema };
