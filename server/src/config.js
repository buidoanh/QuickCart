import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
export function readConfig() {
  for (const key of ['MONGODB_URI', 'CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY']) {
    if (!process.env[key]) throw new Error(`Missing ${key} in server/.env`);
  }
  return {
    port: Number(process.env.PORT || 4000), mongoUri: process.env.MONGODB_URI,
    origins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
    secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  };
}
