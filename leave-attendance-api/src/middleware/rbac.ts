import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import logger from '../lib/logger';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userRoles = user.groups || [];
    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      logger.warn('Access denied', {
        userId: user.userId,
        userRoles,
        allowedRoles,
        correlationId: (req as AuthenticatedRequest).correlationId,
      });

      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

export const requireOwnData = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthenticatedRequest).user;
  const userRoles = user?.groups || [];

  // Admin can access any data
  if (userRoles.includes('ADMIN')) {
    next();
    return;
  }

  // For EMPLOYEE, verify they can only access their own data
  const requestedUserId = req.query.user_id || req.params.user_id || req.body.user_id;

  if (requestedUserId && requestedUserId !== user?.userId) {
    logger.warn('Access denied - not own data', {
      userId: user?.userId,
      requestedUserId,
      correlationId: (req as AuthenticatedRequest).correlationId,
    });

    res.status(403).json({
      code: 'FORBIDDEN',
      message: 'You can only access your own data',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};

