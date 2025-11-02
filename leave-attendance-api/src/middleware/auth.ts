import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwksClient';
import { AuthenticatedRequest, JWTPayload } from '../types';
import logger from '../lib/logger';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = await verifyToken(token);

    (req as AuthenticatedRequest).user = {
      userId: decoded.sub,
      email: decoded.email,
      groups: decoded['cognito:groups'] || [],
      username: decoded['cognito:username'],
    };

    next();
  } catch (error: any) {
    logger.error('Authentication failed', { error: error.message, correlationId: (req as AuthenticatedRequest).correlationId });
    
    res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
};

