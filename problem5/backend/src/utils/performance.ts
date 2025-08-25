import { pool } from '../config/database';

import logger from './logger';

export namespace PerformanceOptimizer {
  /**
   * Monitor and log slow queries
   */
  export async function monitorSlowQueries(): Promise<void> {
    try {
      const slowQueries = await pool.query(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_time > 100 -- Queries taking more than 100ms on average
        ORDER BY mean_time DESC 
        LIMIT 10
      `);

      if (slowQueries.rows.length > 0) {
        logger.warn('Slow queries detected:', slowQueries.rows);
      }
    } catch (error) {
      logger.error('Error monitoring slow queries:', error);
    }
  }

  /**
   * Get database performance metrics
   */
  export async function getDatabaseMetrics(): Promise<Record<string, unknown>> {
    try {
      const metrics = await pool.query(`
        SELECT 
          (SELECT count(*) FROM players) as total_players,
          (SELECT count(*) FROM mining_sessions) as total_sessions,
          (SELECT count(*) FROM action_history) as total_actions,
          (SELECT count(*) FROM anti_cheat_logs) as total_violations,
          (SELECT sum(numbackends) FROM pg_stat_database WHERE datname = current_database()) as active_connections,
          (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections
      `);

      return metrics.rows[0];
    } catch (error) {
      logger.error('Error getting database metrics:', error);
      return {};
    }
  }

  /**
   * Optimize database connections
   */
  export function optimizeConnections(): void {
    try {
      // Check connection pool statistics
      const poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };

      logger.info('Connection pool stats:', poolStats);

      // Log warning if pool is getting full
      if (poolStats.totalCount >= 18) {
        // 18 out of 20 max
        logger.warn('Connection pool is nearly full', poolStats);
      }

      // Close idle connections if too many
      if (poolStats.idleCount > 10) {
        logger.info('Cleaning up idle connections');
        // PostgreSQL pool handles this automatically, but we log it
      }
    } catch (error) {
      logger.error('Error optimizing connections:', error);
    }
  }

  /**
   * Update table statistics for better query planning
   */
  export async function updateTableStatistics(): Promise<void> {
    try {
      const tables = ['players', 'mining_sessions', 'action_history', 'anti_cheat_logs'];

      for (const table of tables) {
        await pool.query(`ANALYZE ${table}`);
      }

      logger.info('Table statistics updated');
    } catch (error) {
      logger.error('Error updating table statistics:', error);
    }
  }

  /**
   * Clean up old records to maintain performance
   */
  export async function cleanupOldRecords(): Promise<void> {
    try {
      const cleanupResults = [];

      // Clean up old action history (keep last 30 days)
      const actionCleanup = await pool.query(`
        DELETE FROM action_history 
        WHERE timestamp < NOW() - INTERVAL '30 days'
      `);
      cleanupResults.push({ table: 'action_history', deleted: actionCleanup.rowCount ?? 0 });

      // Clean up old mining sessions (keep last 60 days)
      const sessionCleanup = await pool.query(`
        DELETE FROM mining_sessions 
        WHERE created_at < NOW() - INTERVAL '60 days'
      `);
      cleanupResults.push({ table: 'mining_sessions', deleted: sessionCleanup.rowCount ?? 0 });

      // Clean up old anti-cheat logs (keep last 90 days)
      const cheatCleanup = await pool.query(`
        DELETE FROM anti_cheat_logs 
        WHERE detected_at < NOW() - INTERVAL '90 days'
      `);
      cleanupResults.push({ table: 'anti_cheat_logs', deleted: cheatCleanup.rowCount ?? 0 });

      logger.info('Old records cleanup completed:', cleanupResults);
    } catch (error) {
      logger.error('Error cleaning up old records:', error);
    }
  }

  /**
   * Check index usage and suggest optimizations
   */
  export async function checkIndexUsage(): Promise<void> {
    try {
      const unusedIndexes = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          attname as column_name,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public' 
        AND tablename IN ('players', 'mining_sessions', 'action_history', 'anti_cheat_logs')
        AND n_distinct < 10
        ORDER BY tablename, attname
      `);

      if (unusedIndexes.rows.length > 0) {
        logger.info('Low cardinality columns (consider index optimization):', unusedIndexes.rows);
      }

      // Check index scan vs sequential scan ratio
      const scanStats = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          CASE 
            WHEN seq_scan + idx_scan = 0 THEN 0
            ELSE round((idx_scan::numeric / (seq_scan + idx_scan)) * 100, 2)
          END as index_usage_percentage
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY index_usage_percentage ASC
      `);

      logger.info('Index usage statistics:', scanStats.rows);
    } catch (error) {
      logger.error('Error checking index usage:', error);
    }
  }

  /**
   * Start performance monitoring (call periodically)
   */
  export function startMonitoring(): void {
    const monitoringInterval = 5 * 60 * 1000; // 5 minutes

    setInterval(async () => {
      try {
        await Promise.all([
          monitorSlowQueries(),
          optimizeConnections(),
          getDatabaseMetrics().then(metrics => logger.info('Database metrics:', metrics)),
        ]);
      } catch (error) {
        logger.error('Performance monitoring error:', error);
      }
    }, monitoringInterval);

    // Daily cleanup
    const dailyCleanup = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(async () => {
      try {
        await Promise.all([cleanupOldRecords(), updateTableStatistics(), checkIndexUsage()]);
      } catch (error) {
        logger.error('Daily cleanup error:', error);
      }
    }, dailyCleanup);

    logger.info('Performance monitoring started');
  }
}
