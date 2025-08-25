import { PrismaClient } from '@prisma/client';

import logger from '../utils/logger';

// Global variable to store Prisma instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client with optimized configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn', 'info'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Prisma database connection successful');
    return true;
  } catch (error) {
    logger.error('Prisma database connection failed:', error);
    return false;
  }
}

// Initialize database connection
export async function initializePrisma(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Prisma client connected successfully');
  } catch (error) {
    logger.error('Failed to connect Prisma client:', error);
    throw error;
  }
}

// Graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting Prisma client:', error);
  }
}

// Performance monitoring helpers
export async function queryWithMetrics<T>(operation: string, query: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const result = await query();
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn(`Slow query detected: ${operation} took ${String(duration)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      logger.info(`Query completed: ${operation} took ${String(duration)}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Query failed: ${operation} failed after ${String(duration)}ms`, error);
    throw error;
  }
}

// Transaction helper with retry logic
export async function executeTransaction<T>(
  operation: string,
  transaction: (
    prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>
  ) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryWithMetrics(`${operation} (attempt ${attempt.toString()})`, () =>
        prisma.$transaction(transaction)
      );
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Transaction attempt ${attempt.toString()} failed for ${operation}:`, error);

      // Don't retry if it's a validation error or constraint violation
      if (
        error instanceof Error &&
        (error.message.includes('Unique constraint') ||
          error.message.includes('Foreign key constraint'))
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }

  throw (
    lastError ?? new Error(`Transaction ${operation} failed after ${String(maxRetries)} attempts`)
  );
}

// Export default instance
export default prisma;
