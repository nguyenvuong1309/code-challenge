import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

import { prisma, queryWithMetrics } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { RegisterRequest, LoginRequest, JWTPayload } from '../types';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export namespace AuthService {
  /**
   * Register new user
   */
  export async function register(registerData: RegisterRequest): Promise<{
    user: Omit<User, 'password'>;
    token: string;
  }> {
    try {
      // Check if user already exists
      const existingUser = await queryWithMetrics('checkExistingUser', () =>
        prisma.user.findFirst({
          where: {
            OR: [
              { email: registerData.email },
              ...(registerData.walletAddress 
                ? [{ walletAddress: registerData.walletAddress }] 
                : []
              ),
            ],
          },
        })
      );

      if (existingUser) {
        if (existingUser.email === registerData.email) {
          throw new AppError('Email already exists', 400);
        }
        if (existingUser.walletAddress === registerData.walletAddress) {
          throw new AppError('Wallet address already exists', 400);
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerData.password, saltRounds);

      // Create user
      const user = await queryWithMetrics('createUser', () =>
        prisma.user.create({
          data: {
            email: registerData.email,
            password: hashedPassword,
            name: registerData.name,
            walletAddress: registerData.walletAddress,
          },
          select: {
            id: true,
            email: true,
            name: true,
            walletAddress: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      );

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      logger.info('New user registered:', { email: user.email, id: user.id });

      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError('Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  export async function login(loginData: LoginRequest): Promise<{
    user: Omit<User, 'password'>;
    token: string;
  }> {
    try {
      // Find user
      const user = await queryWithMetrics('findUserForLogin', () =>
        prisma.user.findUnique({
          where: { email: loginData.email },
        })
      );

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const { password: _, ...userWithoutPassword } = user;

      logger.info('User logged in:', { email: user.email, id: user.id });

      return { user: userWithoutPassword, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Get user by ID
   */
  export async function getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await queryWithMetrics('getUserById', () =>
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            walletAddress: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      );

      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  export async function updateProfile(
    userId: string,
    updateData: {
      name?: string;
      walletAddress?: string;
    }
  ): Promise<Omit<User, 'password'>> {
    try {
      // Check if wallet address is already taken
      if (updateData.walletAddress) {
        const existingWallet = await prisma.user.findFirst({
          where: {
            walletAddress: updateData.walletAddress,
            NOT: { id: userId },
          },
        });

        if (existingWallet) {
          throw new AppError('Wallet address already exists', 400);
        }
      }

      const user = await queryWithMetrics('updateUserProfile', () =>
        prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            walletAddress: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      );

      logger.info('User profile updated:', { userId, updates: Object.keys(updateData) });

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update profile error:', error);
      throw new AppError('Profile update failed', 500);
    }
  }

  /**
   * Change password
   */
  export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await queryWithMetrics('updateUserPassword', () =>
        prisma.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        })
      );

      logger.info('User password changed:', { userId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Change password error:', error);
      throw new AppError('Password change failed', 500);
    }
  }

  /**
   * Generate JWT token
   */
  function generateToken(payload: { userId: string; email: string }): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
  }

  /**
   * Verify JWT token
   */
  export function verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  /**
   * Deactivate user account
   */
  export async function deactivateAccount(userId: string): Promise<void> {
    try {
      await queryWithMetrics('deactivateUser', () =>
        prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        })
      );

      logger.info('User account deactivated:', { userId });
    } catch (error) {
      logger.error('Deactivate account error:', error);
      throw new AppError('Account deactivation failed', 500);
    }
  }
}