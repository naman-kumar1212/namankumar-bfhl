/**
 * Graph controller — thin layer between route and service.
 *
 * Responsibilities:
 *  - Extract validated data from req.body
 *  - Call the service
 *  - Format and send the response
 *  - Catch errors and forward to error handler
 */

const { processGraph } = require('../services/graphService');

/**
 * POST /api/graph/process
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const process = async (req, res, next) => {
  try {
    const { data } = req.body;
    
    const invalid_entries = [];
    const validEdges = [];
    
    // Regex: Node names must be a single uppercase letter (A-Z)
    const edgeRegex = /^([A-Z])->([A-Z])$/;
    
    data.forEach(entry => {
      // Trim whitespace first, then validate
      const trimmed = typeof entry === 'string' ? entry.trim() : entry;
      const match = typeof trimmed === 'string' ? trimmed.match(edgeRegex) : null;
      if (!match) {
        invalid_entries.push(entry);
      } else {
        const from = match[1];
        const to = match[2];
        if (from === to) {
          invalid_entries.push(entry);
        } else {
          validEdges.push({ raw: trimmed, parsed: [from, to] });
        }
      }
    });

    const result = processGraph(validEdges, invalid_entries);

    // Return exact requested JSON structure without wrapping in 'data'
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { process };
