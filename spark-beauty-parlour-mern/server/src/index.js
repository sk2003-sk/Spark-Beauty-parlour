import { cfg } from './config.js';
import { connectDb } from './db.js';
import app from './app.js';
import { seedDatabase } from './seed.js';

await connectDb();
await seedDatabase();
const server = app.listen(cfg.port, () => console.log(`API running on port ${cfg.port}`));

const stop = () => server.close(() => process.exit(0));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
