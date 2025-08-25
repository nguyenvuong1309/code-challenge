import { redis } from '../config/database';
import { prisma, queryWithMetrics } from '../lib/prisma';
import { RateLimitInfo } from '../types';
import logger from '../utils/logger';

export namespace RateLimitService {
  const RATE_LIMIT_WINDOW = 1; // 1 second
  const MAX_REQUESTS = 1; // 1 request per second per user

  /**
   * Check and update rate limit for a user action
   */
  export async function checkRateLimit(
    walletAddress: string,
    actionType = 'general'
  ): Promise<RateLimitInfo> {
    try {
      const key = `rate_limit:${walletAddress}:${actionType}`;
      const now = Date.now();
      const windowStart = Math.floor(now / 1000) * 1000; // Align to second boundary

      // Use Redis pipeline for atomic operations
      const pipeline = redis.multi();

      // Get current count for this window
      pipeline.get(`${key}:${String(windowStart)}`);

      const results = await pipeline.exec();
      const result = results?.[0] as unknown[] | undefined;
      const currentCount = result ? parseInt((result[1] as string) ?? '0') : 0;

      if (currentCount >= MAX_REQUESTS) {
        return {
          remaining: 0,
          resetTime: windowStart + RATE_LIMIT_WINDOW * 1000,
          blocked: true,
        };
      }

      // Increment counter with expiration
      await redis.setEx(
        `${key}:${String(windowStart)}`,
        RATE_LIMIT_WINDOW + 1, // Expire 1 second after window ends
        String(currentCount + 1)
      );

      return {
        remaining: MAX_REQUESTS - currentCount - 1,
        resetTime: windowStart + RATE_LIMIT_WINDOW * 1000,
        blocked: false,
      };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      // On Redis error, allow request but log it
      return {
        remaining: 1,
        resetTime: Date.now() + 1000,
        blocked: false,
      };
    }
  }

  /**
   * Check advanced rate limit with burst protection using database history
   */
  export async function checkAdvancedRateLimit(
    walletAddress: string,
    actionType = 'mining'
  ): Promise<RateLimitInfo> {
    try {
      const key = `adv_rate_limit:${walletAddress}:${actionType}`;
      const now = Date.now();

      // First check Redis for recent activity
      const pipeline = redis.multi();
      for (let i = 0; i < 10; i++) {
        const windowStart = Math.floor((now - i * 1000) / 1000) * 1000;
        pipeline.get(`${key}:${String(windowStart)}`);
      }

      const results = await pipeline.exec();
      const recentCounts =
        results?.map(r => {
          const result = r as unknown[];
          return parseInt((result[1] as string) ?? '0');
        }) ?? [];
      const totalRecent = recentCounts.reduce((sum, count) => sum + count, 0);

      // Allow max 5 requests in last 10 seconds (burst protection)
      if (totalRecent >= 5) {
        logger.warn('Burst rate limit exceeded (Redis):', {
          walletAddress,
          actionType,
          totalRecent,
        });

        return {
          remaining: 0,
          resetTime: now + 10000,
          blocked: true,
        };
      }

      // Double-check with database for mining actions
      if (actionType === 'mining') {
        const dbRecentCount = await queryWithMetrics('checkAdvancedRateLimitDB', () =>
          prisma.actionHistory.count({
            where: {
              playerWallet: walletAddress,
              actionType: 'MINE',
              timestamp: {
                gte: new Date(now - 10 * 1000), // Last 10 seconds
              },
            },
          })
        );

        if (dbRecentCount >= 5) {
          logger.warn('Burst rate limit exceeded (DB):', {
            walletAddress,
            actionType,
            dbRecentCount,
          });

          return {
            remaining: 0,
            resetTime: now + 10000,
            blocked: true,
          };
        }
      }

      return await checkRateLimit(walletAddress, actionType);
    } catch (error) {
      logger.error('Advanced rate limit error:', error);
      return await checkRateLimit(walletAddress, actionType);
    }
  }

  /**
   * Get rate limit status without incrementing
   */
  export async function getRateLimitStatus(
    walletAddress: string,
    actionType = 'general'
  ): Promise<RateLimitInfo> {
    try {
      const key = `rate_limit:${walletAddress}:${actionType}`;
      const now = Date.now();
      const windowStart = Math.floor(now / 1000) * 1000;

      const currentCount = await redis.get(`${key}:${String(windowStart)}`);
      const count = parseInt(currentCount ?? '0');

      return {
        remaining: Math.max(0, this.MAX_REQUESTS - count),
        resetTime: windowStart + this.RATE_LIMIT_WINDOW * 1000,
        blocked: count >= this.MAX_REQUESTS,
      };
    } catch (error) {
      logger.error('Rate limit status error:', error);
      return {
        remaining: 1,
        resetTime: Date.now() + 1000,
        blocked: false,
      };
    }
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  export async function resetRateLimit(
    walletAddress: string,
    actionType = 'general'
  ): Promise<void> {
    try {
      const pattern = `rate_limit:${walletAddress}:${actionType}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(keys);
        logger.info('Rate limit reset:', { walletAddress, actionType, keysDeleted: keys.length });
      }
    } catch (error) {
      logger.error('Rate limit reset error:', error);
    }
  }

  /**
   * Get global rate limit statistics
   */
  export async function getGlobalStats(): Promise<{
    totalActiveUsers: number;
    totalActiveWindows: number;
    timestamp: string;
    playerStats?: {
      totalPlayers: number;
      activePlayers: number;
    };
  }> {
    try {
      const pattern = 'rate_limit:*';
      const keys = await redis.keys(pattern);

      const stats = {
        totalActiveUsers: new Set(keys.map(key => key.split(':')[1])).size,
        totalActiveWindows: keys.length,
        timestamp: new Date().toISOString(),
      };

      // Get additional player statistics from database
      try {
        const [totalPlayers, activePlayers] = await Promise.all([
          queryWithMetrics('getGlobalStats-totalPlayers', () => prisma.player.count()),
          queryWithMetrics('getGlobalStats-activePlayers', () =>
            prisma.player.count({
              where: {
                lastActionTime: {
                  gte: new Date(Date.now() - 60 * 60 * 1000), // Active in last hour
                },
              },
            })
          ),
        ]);

        return {
          ...stats,
          playerStats: {
            totalPlayers,
            activePlayers,
          },
        };
      } catch (dbError) {
        logger.warn('Could not fetch player stats from database:', dbError);
        return stats;
      }
    } catch (error) {
      logger.error('Global stats error:', error);
      return {
        totalActiveUsers: 0,
        totalActiveWindows: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get player specific rate limit history from database
   */
  export async function getPlayerRateLimitHistory(
    walletAddress: string,
    minutesBack = 60
  ): Promise<{
    totalActions: number;
    actionsByMinute: { minute: string; count: number }[];
    averageInterval: number;
  }> {
    try {
      return await queryWithMetrics('getPlayerRateLimitHistory', async () => {
        const actions = await prisma.actionHistory.findMany({
          where: {
            playerWallet: walletAddress,
            timestamp: {
              gte: new Date(Date.now() - minutesBack * 60 * 1000),
            },
          },
          orderBy: { timestamp: 'asc' },
          select: { timestamp: true },
        });

        if (actions.length === 0) {
          return {
            totalActions: 0,
            actionsByMinute: [],
            averageInterval: 0,
          };
        }

        // Group by minute
        const actionsByMinute = new Map<string, number>();
        actions.forEach(action => {
          const minute = action.timestamp.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
          actionsByMinute.set(minute, (actionsByMinute.get(minute) ?? 0) + 1);
        });

        // Calculate average interval between actions
        let totalInterval = 0;
        if (actions.length > 1) {
          for (let i = 1; i < actions.length; i++) {
            totalInterval += actions[i].timestamp.getTime() - actions[i - 1].timestamp.getTime();
          }
        }
        const averageInterval = actions.length > 1 ? totalInterval / (actions.length - 1) : 0;

        return {
          totalActions: actions.length,
          actionsByMinute: Array.from(actionsByMinute.entries()).map(([minute, count]) => ({
            minute,
            count,
          })),
          averageInterval: Math.round(averageInterval),
        };
      });
    } catch (error) {
      logger.error('Player rate limit history error:', error);
      return {
        totalActions: 0,
        actionsByMinute: [],
        averageInterval: 0,
      };
    }
  }

  /**
   * Check if player is exhibiting bot-like behavior
   */
  export async function detectBotBehavior(walletAddress: string): Promise<{
    isBotLike: boolean;
    confidence: number;
    evidence: string[];
  }> {
    try {
      return await queryWithMetrics('detectBotBehavior', async () => {
        const recentActions = await prisma.actionHistory.findMany({
          where: {
            playerWallet: walletAddress,
            actionType: 'MINE',
            timestamp: {
              gte: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
            },
          },
          orderBy: { timestamp: 'asc' },
          select: { timestamp: true, ipAddress: true, userAgent: true },
        });

        const evidence: string[] = [];
        let confidence = 0;

        if (recentActions.length < 3) {
          return { isBotLike: false, confidence: 0, evidence: [] };
        }

        // Check timing regularity
        const intervals = [];
        for (let i = 1; i < recentActions.length; i++) {
          intervals.push(
            recentActions[i].timestamp.getTime() - recentActions[i - 1].timestamp.getTime()
          );
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance =
          intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) /
          intervals.length;
        const standardDeviation = Math.sqrt(variance);

        if (standardDeviation < 500 && intervals.length >= 5) {
          // Very regular timing
          evidence.push('Highly regular timing pattern');
          confidence += 0.4;
        }

        // Check for excessive frequency
        if (recentActions.length > 30) {
          // More than 30 actions in 10 minutes
          evidence.push('Excessive action frequency');
          confidence += 0.3;
        }

        // Check IP/User Agent consistency (should be consistent for normal users)
        const uniqueIPs = new Set(recentActions.map(a => a.ipAddress).filter(Boolean)).size;
        const uniqueUAs = new Set(recentActions.map(a => a.userAgent).filter(Boolean)).size;

        if (uniqueIPs > 2) {
          evidence.push('Multiple IP addresses');
          confidence += 0.2;
        }

        if (uniqueUAs > 2) {
          evidence.push('Multiple user agents');
          confidence += 0.1;
        }

        return {
          isBotLike: confidence >= 0.5,
          confidence: Math.min(confidence, 1.0),
          evidence,
        };
      });
    } catch (error) {
      logger.error('Bot behavior detection error:', error);
      return { isBotLike: false, confidence: 0, evidence: [] };
    }
  }
}
