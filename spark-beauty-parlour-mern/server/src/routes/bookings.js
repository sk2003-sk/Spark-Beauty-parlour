import { Router } from 'express';
import { z } from 'zod';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import { cfg } from '../config.js';
import { ApiError, asyncHandler } from '../utils/index.js';
import { bookableSlots } from '../utils/time.js';
import { reserve, release } from '../utils/slots.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');

router.get('/availability', validate(z.object({ date: isoDate }), 'query'), asyncHandler(async (req, res) => {
  const { date } = req.query;
  const slots = bookableSlots(date);
  const docs = await Slot.find({ date }).lean();
  const taken = new Map(docs.map((d) => [d.time, d.booked]));
  res.json({
    date,
    slots: slots.map((time) => ({ time, available: (taken.get(time) || 0) < cfg.capacity })),
  });
}));

const createBody = z.object({
  serviceIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(10),
  date: isoDate,
  time: z.string().regex(/^\d{2}:00$/),
  notes: z.string().trim().max(300).optional(),
});

router.post('/', requireAuth, validate(createBody), asyncHandler(async (req, res) => {
  const { date, time, notes } = req.body;
  const ids = [...new Set(req.body.serviceIds)];

  // Prices always come from the database, never from the browser
  const services = await Service.find({ _id: { $in: ids }, active: true }).lean();
  if (services.length !== ids.length) throw new ApiError(400, 'One or more services are no longer available');
  if (!bookableSlots(date).includes(time)) throw new ApiError(400, 'That time cannot be booked');

  const duplicate = await Booking.exists({ user: req.user.id, date, time, status: { $in: ['pending', 'confirmed'] } });
  if (duplicate) throw new ApiError(409, 'You already have a booking at that time');

  if (!(await reserve(date, time))) throw new ApiError(409, 'That slot just filled up. Please pick another time.');

  try {
    const booking = await Booking.create({
      user: req.user.id,
      items: services.map((s) => ({ service: s._id, name: s.name, price: s.price })),
      total: services.reduce((sum, s) => sum + s.price, 0),
      date, time, notes,
    });
    res.status(201).json(booking);
  } catch (e) {
    await release(date, time); // give the seat back if saving failed
    throw e;
  }
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  res.json(await Booking.find({ user: req.user.id }).sort({ date: -1, time: -1 }).limit(50).lean());
}));

router.patch('/:id/cancel', requireAuth, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (String(booking.user) !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'You do not have access');
  if (!['pending', 'confirmed'].includes(booking.status)) throw new ApiError(409, 'This booking cannot be cancelled');
  booking.status = 'cancelled';
  await booking.save();
  await release(booking.date, booking.time);
  res.json(booking);
}));

export default router;
