import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { IdempotencyRepository } from '../repositories/IdempotencyRepository';
import logger from '../lib/logger';

const TTL_HOURS = parseInt(process.env.IDEMPOTENCY_TTL_HOURS || '24');

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Only apply to POST, PUT, PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    next();
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    next();
    return;
  }

  try {
    const repository = new IdempotencyRepository();

    // Check for existing response
    const cached = await repository.get(idempotencyKey);

    if (cached) {
      logger.info('Returning cached idempotent response', {
        key: idempotencyKey,
        statusCode: cached.statusCode,
        correlationId: (req as AuthenticatedRequest).correlationId,
      });

      res.status(cached.statusCode).json(cached.responseBody);
      return;
    }

    // Capture response for caching
    const originalSend = res.json.bind(res);

    res.json = function (body: any) {
      // Store response with TTL
      repository
        .store(idempotencyKey, body, res.statusCode, TTL_HOURS)
        .catch((error) => {
          logger.error('Failed to store idempotent response', {
            key: idempotencyKey,
            error,
            correlationId: (req as AuthenticatedRequest).correlationId,
          });
        });

      return originalSend(body);
    };

    next();
  } catch (error) {
    logger.error('Idempotency middleware error', {
      error,
      correlationId: (req as AuthenticatedRequest).correlationId,
    });
    // Continue without idempotency on error
    next();
  }
};

// Cleanup job for old idempotency keys
export const cleanupIdempotencyKeys = async (): Promise<void> => {
  try {
    const repository = new IdempotencyRepository();
    const deleted = await repository.cleanup(TTL_HOURS);
    logger.info(`Cleaned up ${deleted} old idempotency keys`);
  } catch (error) {
    logger.error('Failed to cleanup idempotency keys', { error });
  }
};

// Run cleanup every hour
setInterval(cleanupIdempotencyKeys, 60 * 60 * 1000);

