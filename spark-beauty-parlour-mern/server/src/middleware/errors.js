import { ApiError } from '../utils/index.js';
import { cfg } from '../config.js';

export const notFound = (_req, _res, next) => next(new ApiError(404, 'Not found'));

export const errorHandler = (err, _req, res, _next) => {
  if (err.code === 11000) err = new ApiError(409, 'That already exists');
  if (err.name === 'CastError') err = new ApiError(400, 'Invalid id');
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 && cfg.env === 'production' ? 'Something went wrong' : err.message,
    details: err.details,
  });
};
