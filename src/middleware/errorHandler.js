/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error',
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    if (err.errors) {
      errorResponse.errors = err.errors;
    }
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Error handling wrapper for async route handlers
 * This allows us to use async/await in routes without try/catch blocks
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);