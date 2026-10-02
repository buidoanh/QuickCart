import mongoose from 'mongoose';
import { readConfig } from './config.js';
import { createApp } from './app.js';
try {
  const config = readConfig();
  mongoose.set('bufferCommands', false);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid') throw new Error('MongoDB must support transactions: use Atlas or a replica set');
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  const server = createApp(config).listen(config.port, () => console.log(`QuickCart API ready on http://localhost:${config.port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
  server.on('error', error => { console.error(`HTTP startup failed (${error.code || error.name})`); process.exit(1); });
} catch (error) {
  console.error(error.message.startsWith('Missing ') || error.message.startsWith('MongoDB must') ? error.message : `Backend startup failed (${error.code || error.name}). Check server/.env and database connectivity.`);
  await mongoose.disconnect();
  process.exitCode = 1;
}
