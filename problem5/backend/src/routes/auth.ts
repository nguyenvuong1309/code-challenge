import express from 'express';
import Joi from 'joi';

import { AppError } from '../middleware/errorHandler';
import { authenticateToken, authRateLimit } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, RegisterRequest, LoginRequest } from '../types';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().min(2).max(100).required(),
  walletAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid wallet address format',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  walletAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid wallet address format',
    }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user account
 *     description: Create a new user account with email/password authentication
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "securePassword123"
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Doe"
 *               walletAddress:
 *                 type: string
 *                 pattern: "^0x[a-fA-F0-9]{40}$"
 *                 example: "0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1"
 *                 description: "Optional Ethereum wallet address"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     token:
 *                       type: string
 *                       description: "JWT access token"
 *       400:
 *         description: Validation error or email/wallet already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const registerData = req.body as RegisterRequest;
    const result = await AuthService.register(registerData);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                           nullable: true
 *                     token:
 *                       type: string
 *                       description: "JWT access token"
 *       401:
 *         description: Invalid credentials or account deactivated
 *       500:
 *         description: Internal server error
 */
router.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const loginData = req.body as LoginRequest;
    const result = await AuthService.login(loginData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         walletAddress:
 *                           type: string
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing token
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await AuthService.getUserById(req.user!.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Smith"
 *               walletAddress:
 *                 type: string
 *                 pattern: "^0x[a-fA-F0-9]{40}$"
 *                 nullable: true
 *                 example: "0x742d35Cc6634C0532925a3b8D397b5dcEF72b0d1"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: Validation error or wallet address already exists
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const user = await AuthService.updateProfile(req.user!.id, req.body);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the authenticated user's password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newSecurePassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or incorrect current password
 */
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user!.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;