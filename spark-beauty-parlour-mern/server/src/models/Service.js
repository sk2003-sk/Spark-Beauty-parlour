import mongoose from 'mongoose';

export const CATEGORIES = [
  'D-Tan', 'Bleach', 'Basic Facials', 'Advanced Facials',
  'Premium Facials', 'Hair Care', 'Pedicure & Manicure', 'Waxing',
];

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
    sort: { type: Number, default: 100 },
  },
  { timestamps: true }
);
schema.index({ active: 1, sort: 1, price: 1 });

export default mongoose.model('Service', schema);
