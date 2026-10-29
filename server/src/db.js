import mongoose from 'mongoose';
import { cfg } from './config.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(cfg.mongo);
  console.log('MongoDB connected');
}
