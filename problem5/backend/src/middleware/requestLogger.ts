import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): any {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';

    logger.log(level, 'HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      ...(req.body &&
        Object.keys(req.body).length > 0 && {
          body: sanitizeBody(req.body),
        }),
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

function sanitizeBody(body: any): any {
  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'signature', 'privateKey', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}
