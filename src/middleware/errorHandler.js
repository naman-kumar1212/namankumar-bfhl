/**
 * Global error handler middleware.
 * 
 * Must be registered LAST in the middleware chain.
 * Catches anything thrown or passed via next(err) and returns
 * a consistent JSON error envelope.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log full error in development for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
