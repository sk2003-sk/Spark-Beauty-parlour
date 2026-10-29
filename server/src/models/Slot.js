import mongoose from 'mongoose';

// One document per date and hour. "booked" counts the seats already taken.
const schema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  booked: { type: Number, default: 0, min: 0 },
});
schema.index({ date: 1, time: 1 }, { unique: true });

export default mongoose.model('Slot', schema);
