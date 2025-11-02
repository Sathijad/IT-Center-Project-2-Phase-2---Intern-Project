import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import logger from './lib/logger';

dotenv.config();

const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        correlationId: req.headers['x-request-id'],
      });
    });
    next();
  });

  // Routes
  app.use('/', routes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

export default createApp;

