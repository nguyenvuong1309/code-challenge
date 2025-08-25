import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = new AppError(err.message, 500);
  if (err instanceof AppError) {
    error = err;
  }

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // PostgreSQL errors
  if (err.name === 'QueryFailedError' || (err as unknown as { code?: string }).code) {
    const pgError = err as unknown as { code?: string };

    switch (pgError.code) {
      case '23505': // Unique violation
        error = new AppError('Duplicate entry', 409);
        break;
      case '23503': // Foreign key violation
        error = new AppError('Referenced record not found', 400);
        break;
      case '23514': // Check violation
        error = new AppError('Invalid data provided', 400);
        break;
      default:
        error = new AppError('Database error', 500);
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const validationErr = err as unknown as { details?: Record<string, { message: string }> };
    const message = Object.values(validationErr.details ?? {})
      .map((val: { message: string }) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production' && error.statusCode === 500
      ? 'Something went wrong'
      : error.message;

  res.status(error.statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
