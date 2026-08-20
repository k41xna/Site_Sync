import AppError from '../utils/appError.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log unhandled server errors (500) for diagnostics, but skip in test suites to keep logs clean
  if (err.statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Internal Error:', err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle common MongoDB / Mongoose errors gracefully
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      status: 'fail',
      message: 'Resource already exists due to a duplicate key conflict.'
    });
  }

  // Fallback for unhandled/internal server errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
};

export default errorHandler;
