import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // Thrown at import time so misconfiguration fails fast in dev/build,
  // instead of surfacing as a confusing runtime DB error later.
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface IMongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across hot-reloads / serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: IMongooseCache | undefined;
}

const cached: IMongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
