import { ApiError } from '../utils/index.js';

// Validates and cleans req.body / req.query with a zod schema
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new ApiError(400, 'Please check the form', result.error.flatten().fieldErrors));
  }
  req[source] = result.data;
  next();
};
