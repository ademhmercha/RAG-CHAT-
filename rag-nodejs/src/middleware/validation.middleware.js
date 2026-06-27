// Request validation middleware.
// Runs a validator function against the request body (and optionally file)
// and returns a 400 response with errors if validation fails.

const validate = (validator) => {
  return (req, res, next) => {
    const errors = validator.validate ? validator.validate(req.body, req.file) : [];

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

module.exports = { validate };
