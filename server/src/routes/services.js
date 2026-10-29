import { Router } from 'express';
import { z } from 'zod';
import Service, { CATEGORIES } from '../models/Service.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const admin = [requireAuth, requireRole('admin')];

const body = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().int().min(0).max(100000),
  active: z.boolean().optional(),
});

router.get('/', asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await Service.find({ active: true }).sort({ sort: 1, price: 1 }).lean());
}));

router.get('/all', ...admin, asyncHandler(async (_req, res) => {
  res.json(await Service.find().sort({ sort: 1, price: 1 }).lean());
}));

router.post('/', ...admin, validate(body), asyncHandler(async (req, res) => {
  res.status(201).json(await Service.create({ ...req.body, sort: CATEGORIES.indexOf(req.body.category) * 10 + 5 }));
}));

router.patch('/:id', ...admin, validate(body.partial()), asyncHandler(async (req, res) => {
  const doc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) throw new ApiError(404, 'Service not found');
  res.json(doc);
}));

router.delete('/:id', ...admin, asyncHandler(async (req, res) => {
  const doc = await Service.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, 'Service not found');
  res.json({ ok: true });
}));

export default router;
