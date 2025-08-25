import app from './app';
import { connectDB, connectRedis } from './config/database';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (PID: ${process.pid})`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

void startServer();
