import 'dotenv/config';

const need = (key) => {
  if (!process.env[key]) throw new Error(`Missing environment variable: ${key}`);
  return process.env[key];
};

export const cfg = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongo: need('MONGO_URI'),
  accessSecret: need('JWT_ACCESS_SECRET'),
  refreshSecret: need('JWT_REFRESH_SECRET'),
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
  tz: process.env.TIMEZONE || 'Asia/Kolkata',
  open: Number(process.env.OPEN_HOUR) || 10,
  close: Number(process.env.CLOSE_HOUR) || 20,
  capacity: Number(process.env.SLOT_CAPACITY) || 2,
  windowDays: Number(process.env.BOOKING_WINDOW_DAYS) || 14,
};
