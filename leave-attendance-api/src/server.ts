import dotenv from 'dotenv';
import { createApp } from './app';
import { createPool } from './lib/db';
import { closePool } from './lib/db';
import logger from './lib/logger';

dotenv.config();

const PORT = process.env.PORT || 8082;

// Initialize database pool
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'itcenter_auth',
  user: process.env.DB_USER || 'itcenter',
  password: process.env.DB_PASSWORD || 'password',
};

createPool(poolConfig);

// Create Express app
const app = createApp();

// Start server
const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, nodeEnv: process.env.NODE_ENV });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await closePool();
  process.exit(0);
});

export default app;

