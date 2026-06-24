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
    const { edges } = req.body;
    const result = processGraph(edges);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { process };
