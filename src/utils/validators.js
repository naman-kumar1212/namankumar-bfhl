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
  body('edges')
    .exists({ checkNull: true })
    .withMessage('Field "edges" is required')
    .isArray({ min: 1 })
    .withMessage('"edges" must be a non-empty array'),

  body('edges.*')
    .isArray({ min: 2, max: 2 })
    .withMessage('Each edge must be an array of exactly 2 elements [from, to]'),

  body('edges.*.*')
    .isString()
    .withMessage('Each node in an edge must be a string')
    .trim()
    .notEmpty()
    .withMessage('Node identifiers cannot be empty strings'),
];

/**
 * Middleware that runs AFTER the validation chain.
 * If any rule failed, return 400 with all error messages.
 * Also performs custom checks that express-validator can't do declaratively:
 *   - Self-loop detection (from === to)
 */
const validateGraphInput = (req, res, next) => {
  // Check express-validator results first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    // Deduplicate messages
    const unique = [...new Set(messages)];
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: unique,
    });
  }

  // Custom validation: check for self-loops
  const { edges } = req.body;
  const selfLoops = [];

  for (let i = 0; i < edges.length; i++) {
    const [from, to] = edges[i];
    if (from.trim() === to.trim()) {
      selfLoops.push(`Edge at index ${i}: self-loop detected ("${from}" → "${to}")`);
    }
  }

  if (selfLoops.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Self-loops are not allowed',
      details: selfLoops,
    });
  }

  next();
};

module.exports = {
  graphValidationRules,
  validateGraphInput,
};
