import mongoose, { ConnectionStates } from 'mongoose';
import { env } from '@/config';
import { logger } from '@/shared/utils/logger.util';

/**
 * Mongoose connection for MongoDB.
 * Only connects when MONGO_URI is provided.
 */
export async function connectMongo(): Promise<void> {
  if (!env.MONGO_URI) {
    return;
  }
  if (mongoose.connection.readyState === ConnectionStates.connected) {
    return;
  }

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err: Error) => logger.error('MongoDB error', { err }));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGO_URI);
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== ConnectionStates.disconnected) {
    await mongoose.disconnect();
  }
}
