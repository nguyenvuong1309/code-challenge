import { Response, NextFunction } from 'express';

import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

import { AppError } from './errorHandler';

/**
 * JWT Authentication middleware
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Get user details
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Authentication failed:', { error: error.message, ip: req.ip });
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Get user details
    const user = await AuthService.getUserById(payload.userId);
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress || undefined,
      };
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    logger.debug('Optional auth failed:', error);
    next();
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This would integrate with Redis rate limiting
  // For now, just pass through
  next();
};