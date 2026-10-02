import mongoose from 'mongoose';

let connectionPromise;

export function connectDatabase(mongoUri) {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      const hello = await mongoose.connection.db.admin().command({ hello: 1 });
      if (!hello.setName && hello.msg !== 'isdbgrid') {
        throw new Error('MongoDB must support transactions: use Atlas or a replica set');
      }
      await Promise.all(Object.values(mongoose.models).map(model => model.init()));
    })().catch(async error => {
      await mongoose.disconnect();
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
}
