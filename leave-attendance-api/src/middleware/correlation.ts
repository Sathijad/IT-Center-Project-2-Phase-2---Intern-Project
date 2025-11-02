import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../types';

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-request-id'] || uuidv4();
  (req as AuthenticatedRequest).correlationId = correlationId as string;
  res.setHeader('X-Request-ID', correlationId as string);
  next();
};

