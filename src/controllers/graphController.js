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
    
    // Regex: Node names must be alphabets (at least one letter on each side of ->)
    const edgeRegex = /^([a-zA-Z]+)->([a-zA-Z]+)$/;
    
    data.forEach(entry => {
      const match = entry.match(edgeRegex);
      if (!match) {
        invalid_entries.push(entry);
      } else {
        const from = match[1];
        const to = match[2];
        validEdges.push({ raw: entry, parsed: [from, to] });
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
