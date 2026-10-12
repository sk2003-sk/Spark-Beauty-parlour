import Slot from '../models/Slot.js';
import { cfg } from '../config.js';

/**
 * Atomically takes one seat in a slot.
 * The filter only matches while seats are left. If the slot document exists but is full,
 * the upsert tries to insert a duplicate and the unique index throws E11000, which means "full".
 * Two customers can never take the last seat at the same time.
 */
export async function reserve(date, time) {
  try {
    const slot = await Slot.findOneAndUpdate(
      { date, time, booked: { $lt: cfg.capacity } },
      { $inc: { booked: 1 } },
      { upsert: true, new: true }
    );
    return Boolean(slot);
  } catch (e) {
    if (e.code === 11000) return false;
    throw e;
  }
}

export const release = (date, time) =>
  Slot.updateOne({ date, time, booked: { $gt: 0 } }, { $inc: { booked: -1 } });
