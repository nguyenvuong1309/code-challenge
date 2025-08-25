import express from 'express';

import { pool, redis } from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check endpoint
 *     description: |
 *       Comprehensive health check endpoint for monitoring and load balancers.
 *       Checks connectivity to all critical system components.
 *
 *       **Health Checks Include:**
 *       - PostgreSQL database connectivity and response time
 *       - Redis cache connectivity and response time
 *       - System memory usage and process information
 *       - Application uptime and version information
 *
 *       **Use Cases:**
 *       - Load balancer health checks
 *       - Monitoring system integration
 *       - Deployment verification
 *       - System diagnostic information
 *
 *       **Response Codes:**
 *       - **200**: All systems healthy
 *       - **503**: One or more systems unhealthy
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['healthy']
 *                   example: 'healthy'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Health check timestamp
 *                   example: '2023-11-01T10:30:00Z'
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                   example: 3600.5
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: 'ok'
 *                         responseTime:
 *                           type: string
 *                           description: Database response time
 *                           example: '15ms'
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: 'ok'
 *                         responseTime:
 *                           type: string
 *                           description: Redis response time
 *                           example: '5ms'
 *                 totalResponseTime:
 *                   type: string
 *                   description: Total health check response time
 *                   example: '20ms'
 *                 pid:
 *                   type: integer
 *                   description: Process ID
 *                   example: 12345
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: integer
 *                       description: Resident Set Size (physical memory)
 *                       example: 52428800
 *                     heapTotal:
 *                       type: integer
 *                       description: Total heap size
 *                       example: 20971520
 *                     heapUsed:
 *                       type: integer
 *                       description: Used heap size
 *                       example: 15728640
 *                     external:
 *                       type: integer
 *                       description: External memory usage
 *                       example: 1048576
 *                     arrayBuffers:
 *                       type: integer
 *                       description: Array buffer memory usage
 *                       example: 524288
 *                 version:
 *                   type: string
 *                   description: Application version
 *                   example: '1.0.0'
 *             example:
 *               status: 'healthy'
 *               timestamp: '2023-11-01T10:30:00Z'
 *               uptime: 3600.5
 *               checks:
 *                 database:
 *                   status: 'ok'
 *                   responseTime: '15ms'
 *                 redis:
 *                   status: 'ok'
 *                   responseTime: '5ms'
 *               totalResponseTime: '20ms'
 *               pid: 12345
 *               memory:
 *                 rss: 52428800
 *                 heapTotal: 20971520
 *                 heapUsed: 15728640
 *                 external: 1048576
 *                 arrayBuffers: 524288
 *               version: '1.0.0'
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: ['unhealthy']
 *                   example: 'unhealthy'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2023-11-01T10:30:00Z'
 *                 error:
 *                   type: string
 *                   description: Error description
 *                   example: 'Database connection failed'
 *                 pid:
 *                   type: integer
 *                   description: Process ID
 *                   example: 12345
 *             example:
 *               status: 'unhealthy'
 *               timestamp: '2023-11-01T10:30:00Z'
 *               error: 'Database connection failed'
 *               pid: 12345
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const _dbResult = await pool.query('SELECT 1');
    const dbTime = Date.now() - startTime;

    // Check Redis connection
    const redisStartTime = Date.now();
    await redis.ping();
    const redisTime = Date.now() - redisStartTime;

    const totalTime = Date.now() - startTime;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'ok',
          responseTime: `${dbTime}ms`,
        },
        redis: {
          status: 'ok',
          responseTime: `${redisTime}ms`,
        },
      },
      totalResponseTime: `${totalTime}ms`,
      pid: process.pid,
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      pid: process.pid,
    });
  }
});

/**
 * GET /health/ready
 * Readiness check for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    // More thorough checks for readiness
    await pool.query('SELECT 1 FROM players LIMIT 1');
    await redis.ping();

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /health/live
 * Liveness check for Kubernetes
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

export default router;
