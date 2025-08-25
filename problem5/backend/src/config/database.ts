import { Pool } from 'pg';
import { createClient } from 'redis';

import { initializePrisma, checkDatabaseConnection } from '../lib/prisma';
import logger from '../utils/logger';

// Legacy PostgreSQL connection pool (deprecated - use Prisma instead)
// Kept for Redis and any remaining raw queries during transition
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduced from 20 since most queries now use Prisma
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
export const redis = createClient({
  url: process.env.REDIS_URL,
});

export async function connectDB(): Promise<void> {
  try {
    // Initialize Prisma (primary database connection)
    await initializePrisma();

    // Check Prisma connection
    const prismaConnected = await checkDatabaseConnection();
    if (!prismaConnected) {
      throw new Error('Prisma connection failed');
    }

    // Test legacy pool connection (for Redis queries)
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connections established (Prisma + Legacy Pool)');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export async function connectRedis(): Promise<void> {
  try {
    redis.on('error', err => {
      logger.error('Redis error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redis.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

// Legacy database query helper (DEPRECATED - use Prisma instead)
// Only kept for Redis operations and migration compatibility
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  logger.warn('Using legacy query function - consider migrating to Prisma', {
    query: text.substring(0, 50) + '...',
  });

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn(`Slow legacy query detected: ${String(duration)}ms`, { query: text });
    }

    return res;
  } catch (error) {
    logger.error('Legacy database query error:', { error, query: text, params });
    throw error;
  }
}
