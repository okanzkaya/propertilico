const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    status: 'error',
    statusCode,
  });
};

module.exports = { notFound, errorHandler };