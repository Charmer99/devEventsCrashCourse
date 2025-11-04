/**
 * Mongoose connection helper for Next.js (TypeScript)
 * - Caches the connection across hot reloads in development to prevent creating multiple connections
 * - Provides a typed, reusable connect function for API routes, server actions, and route handlers
 *
 * Usage:
 *   await connectToDatabase();
 *
 * Requires:
 *   - process.env.MONGODB_URI: Full MongoDB connection string
 *   - (optional) process.env.MONGODB_DB: Database name override for the connection
 */

import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";

// Shape of our cached connection in the Node.js global scope
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment the Node global type so TypeScript knows about our cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Reuse the global cache if it exists (helps with Next.js hot-reload in dev)
const cached: MongooseCache = globalThis.mongooseCache ?? (globalThis.mongooseCache = { conn: null, promise: null });

/**
 * Establish (or reuse) a Mongoose connection.
 * The connection is cached to avoid creating multiple connections during development
 * or on repeated invocations in serverless environments.
 */
export async function connectToDatabase(uri: string | undefined = process.env.MONGODB_URI): Promise<Mongoose> {
  if (!uri || uri.length === 0) {
    throw new Error("MONGODB_URI is not set. Define it in your environment (e.g., .env.local).");
  }

  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Prepare connection options; keep conservative, production-friendly defaults
  const dbName = process.env.MONGODB_DB;
  const opts: ConnectOptions = {
    // Fail fast instead of buffering operations when not connected
    bufferCommands: false,
    // Allow overriding pool size via env when needed
    maxPoolSize: process.env.MONGODB_MAX_POOL_SIZE ? Number(process.env.MONGODB_MAX_POOL_SIZE) : undefined,
    // Respect optional explicit db name if provided
    dbName: dbName && dbName.length > 0 ? dbName : undefined,
    // Reasonable timeouts for production
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  };

  // Create the initial connection promise once
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise so the next call can retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
