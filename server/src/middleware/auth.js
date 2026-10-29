import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/index.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please log in');
  let payload;
  try {
    payload = jwt.verify(token, cfg.accessSecret);
  } catch {
    throw new ApiError(401, 'Session expired');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account not found');
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new ApiError(403, 'You do not have access'));
