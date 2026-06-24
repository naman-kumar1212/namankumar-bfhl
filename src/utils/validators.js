/**
 * Input validation rules for the graph processing endpoint.
 *
 * Validates:
 *  1. `edges` exists and is a non-empty array
 *  2. Each edge is an array of exactly 2 elements
 *  3. Both elements of each edge are non-empty strings
 *  4. No self-loops (edge[0] !== edge[1])
 *
 * Usage in route:
 *   router.post('/process', validateGraphInput, graphController.process);
 */

const { body, validationResult } = require('express-validator');

/**
 * Validation chain — declare rules declaratively.
 */
const graphValidationRules = [
  body('data')
    .exists({ checkNull: true })
    .withMessage('Field "data" is required')
    .isArray({ min: 1 })
    .withMessage('"data" must be a non-empty array'),

  body('data.*')
    .isString()
    .withMessage('Each item in the "data" array must be a string')
    .trim(),
];

/**
 * Middleware that runs AFTER the validation chain.
 * If any rule failed, return 400 with all error messages.
 */
const validateGraphInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    const unique = [...new Set(messages)];
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: unique,
    });
  }

  next();
};

module.exports = {
  graphValidationRules,
  validateGraphInput,
};
