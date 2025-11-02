import { Pool, PoolConfig } from 'pg';
import logger from './logger';

let pool: Pool | null = null;

export const createPool = (config: PoolConfig): Pool => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    ...config,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
  });

  pool.on('error', (err) => {
    logger.error('Unexpected database pool error', { error: err });
  });

  pool.on('connect', () => {
    logger.info('Database connection established');
  });

  return pool;
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool first.');
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database health check passed', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};

