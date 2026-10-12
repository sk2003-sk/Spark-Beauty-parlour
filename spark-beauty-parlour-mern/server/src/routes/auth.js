import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { cfg } from '../config.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prod = cfg.env === 'production';

// Refresh token lives in an httpOnly cookie, so page scripts can never read it
const { maxAge, ...clearOpts } = {
  httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', path: '/api/auth', maxAge: 7 * 24 * 3600 * 1000,
};
const cookieOpts = { ...clearOpts, maxAge };

const signAccess = (u) => jwt.sign({ sub: u.id, role: u.role }, cfg.accessSecret, { expiresIn: '15m' });
const signRefresh = (u) => jwt.sign({ sub: u.id, tv: u.tokenVersion }, cfg.refreshSecret, { expiresIn: '7d' });

function issue(res, user) {
  res.cookie('rt', signRefresh(user), cookieOpts);
  return { user, accessToken: signAccess(user) };
}

const registerBody = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z.string().trim().regex(/^\d{10}$/, 'Enter a 10-digit phone number'),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
});
const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

router.post('/register', validate(registerBody), asyncHandler(async (req, res) => {
  if (await User.exists({ email: req.body.email })) throw new ApiError(409, 'This email is already registered');
  const { password, ...rest } = req.body;
  const user = await User.create({ ...rest, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json(issue(res, user));
}));

router.post('/login', validate(loginBody), asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash +tokenVersion');
  const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!ok) throw new ApiError(401, 'Wrong email or password');
  res.json(issue(res, user));
}));

// Called when the site opens and whenever the 15 minute access token runs out
router.post('/refresh', asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = jwt.verify(req.cookies.rt || '', cfg.refreshSecret);
  } catch {
    throw new ApiError(401, 'Please log in');
  }
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || user.tokenVersion !== payload.tv) throw new ApiError(401, 'Please log in');
  res.json(issue(res, user));
}));

router.post('/logout', asyncHandler(async (req, res) => {
  try {
    const payload = jwt.verify(req.cookies.rt || '', cfg.refreshSecret);
    await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
  } catch { /* already logged out */ }
  res.clearCookie('rt', clearOpts);
  res.json({ ok: true });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
