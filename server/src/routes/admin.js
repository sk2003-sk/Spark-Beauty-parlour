import { Router } from 'express';
import { z } from 'zod';
import Booking, { STATUSES } from '../models/Booking.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import { nowInTz } from '../utils/time.js';
import { release } from '../utils/slots.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: [] };

const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get('/bookings', validate(listQuery, 'query'), asyncHandler(async (req, res) => {
  const { status, date, page, limit } = req.query;
  const filter = { ...(status && { status }), ...(date && { date }) };
  const [data, total] = await Promise.all([
    Booking.find(filter).sort({ date: -1, time: 1 }).skip((page - 1) * limit).limit(limit)
      .populate('user', 'name phone email').lean(),
    Booking.countDocuments(filter),
  ]);
  res.json({ data, page, total, pages: Math.max(1, Math.ceil(total / limit)) });
}));

router.patch('/bookings/:id/status', validate(z.object({ status: z.enum(STATUSES) })), asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!NEXT[booking.status].includes(req.body.status)) {
    throw new ApiError(409, `A ${booking.status} booking cannot become ${req.body.status}`);
  }
  booking.status = req.body.status;
  await booking.save();
  if (booking.status === 'cancelled') await release(booking.date, booking.time);
  res.json(booking);
}));

// Dashboard numbers, calculated inside MongoDB with aggregation pipelines
router.get('/stats', asyncHandler(async (_req, res) => {
  const today = nowInTz().date;
  const active = { $in: ['pending', 'confirmed'] };
  const [byStatus, todayCount, upcoming, topServices] = await Promise.all([
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
    Booking.countDocuments({ date: today, status: active }),
    Booking.countDocuments({ date: { $gte: today }, status: active }),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', count: { $sum: 1 }, revenue: { $sum: '$items.price' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);
  const status = Object.fromEntries(byStatus.map((s) => [s._id, s]));
  res.json({
    today: todayCount,
    upcoming,
    pending: status.pending?.count || 0,
    completed: status.completed?.count || 0,
    revenue: status.completed?.revenue || 0,
    topServices,
  });
}));

export default router;
