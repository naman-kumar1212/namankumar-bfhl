/**
 * Graph API routes.
 *
 * POST /api/graph/process
 *   → validation rules (express-validator)
 *   → validation result check + self-loop check
 *   → controller.process
 */

const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');
const { graphValidationRules, validateGraphInput } = require('../utils/validators');

// POST /bfhl
router.post(
  '/',
  graphValidationRules,       // 1. Declarative validation rules
  validateGraphInput,         // 2. Check results + custom self-loop check
  graphController.process     // 3. Controller
);

// GET /bfhl
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    operation_code: 1,
  });
});

module.exports = router;
