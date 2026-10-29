import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './db.js';
import Service, { CATEGORIES } from './models/Service.js';
import User from './models/User.js';

const MENU = {
  'D-Tan': [['D-Tan', 99], ['Raaga O3 D-Tan', 199]],
  'Bleach': [['Whitening / Gold Bleach', 149]],
  'Basic Facials': [['Fruit Facial', 399], ['D-Tan Facial', 399], ['Whitening Facial', 399], ['Wine Facial', 399]],
  'Advanced Facials': [['Pearl Facial', 699], ['Gold Facial', 699], ['Diamond Facial', 699]],
  'Premium Facials': [['Hydra Facial', 999], ['Korean Facial', 999], ['O3 Facial', 1499]],
  'Hair Care': [['Hair Spa', 249]],
  'Pedicure & Manicure': [['Basic Pedicure & Manicure', 499]],
  'Waxing': [['Hand Wax + Leg Wax', 299]],
};

export async function seedDatabase() {
  const ops = [];
  for (const category of CATEGORIES) {
    MENU[category].forEach(([name, price], i) => {
      ops.push({
        updateOne: {
          filter: { name },
          // Only inserts missing services, so prices you edited later are kept
          update: { $setOnInsert: { name, category, price, active: true, sort: CATEGORIES.indexOf(category) * 10 + i } },
          upsert: true,
        },
      });
    });
  }
  const result = await Service.bulkWrite(ops);
  console.log(`Services added: ${result.upsertedCount}`);

  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (email && password.length >= 8) {
    if (!(await User.exists({ email }))) {
      await User.create({
        name: 'Parlour Owner', email, phone: process.env.ADMIN_PHONE || '0000000000',
        passwordHash: await bcrypt.hash(password, 12), role: 'admin',
      });
      console.log(`Admin account created: ${email}`);
    } else {
      console.log('Admin account already exists');
    }
  } else {
    console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in .env to create the owner login');
  }
}

// Allow running seed directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  await connectDb();
  await seedDatabase();
  await mongoose.disconnect();
}
