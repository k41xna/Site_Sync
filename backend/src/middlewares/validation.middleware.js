import AppError from '../utils/appError.js';

/**
 * Generic Express middleware to validate request inputs (body, query, params) against a Zod schema.
 * @param {Object} schema - Zod schema to validate against
 */
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    // Collect all validation error messages into a single response string
    const message = error.errors.map((err) => err.message).join(', ');
    next(new AppError(message, 400));
  }
};

export default validate;
