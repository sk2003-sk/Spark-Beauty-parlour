import mongoose from 'mongoose';

export const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Names and prices are copied so old bookings stay correct if the menu changes
    items: [{
      _id: false,
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      name: String,
      price: Number,
    }],
    total: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: STATUSES, default: 'pending' },
    notes: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);
schema.index({ user: 1, date: -1 });
schema.index({ date: 1, status: 1 });

export default mongoose.model('Booking', schema);
