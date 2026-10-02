import mongoose from 'mongoose';
import { readConfig } from './config.js';
import { createApp } from './app.js';
import { connectDatabase } from './database.js';
try {
  const config = readConfig();
  await connectDatabase(config.mongoUri);
  const server = createApp(config).listen(config.port, () => console.log(`QuickCart API ready on http://localhost:${config.port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
  server.on('error', error => { console.error(`HTTP startup failed (${error.code || error.name})`); process.exit(1); });
} catch (error) {
  console.error(error.message.startsWith('Missing ') || error.message.startsWith('MongoDB must') ? error.message : `Backend startup failed (${error.code || error.name}). Check server/.env and database connectivity.`);
  await mongoose.disconnect();
  process.exitCode = 1;
}
