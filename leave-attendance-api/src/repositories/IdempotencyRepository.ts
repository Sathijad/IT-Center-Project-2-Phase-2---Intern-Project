import { getPool } from '../lib/db';
import logger from '../lib/logger';

export class IdempotencyRepository {
  async get(key: string): Promise<{ responseBody: any; statusCode: number } | null> {
    const pool = getPool();
    try {
      const result = await pool.query(
        'SELECT response_body, status_code FROM idempotency_keys WHERE key = $1 AND created_at > NOW() - INTERVAL \'24 hours\'',
        [key]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        responseBody: result.rows[0].response_body,
        statusCode: result.rows[0].status_code,
      };
    } catch (error) {
      logger.error('Failed to get idempotency key', { key, error });
      throw error;
    }
  }

  async store(key: string, responseBody: any, statusCode: number, ttlHours: number): Promise<void> {
    const pool = getPool();
    try {
      await pool.query(
        'INSERT INTO idempotency_keys (key, response_body, status_code) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING',
        [key, JSON.stringify(responseBody), statusCode]
      );
    } catch (error) {
      logger.error('Failed to store idempotency key', { key, error });
      throw error;
    }
  }

  async cleanup(ttlHours: number): Promise<number> {
    const pool = getPool();
    try {
      const result = await pool.query(
        'DELETE FROM idempotency_keys WHERE created_at < NOW() - INTERVAL \'$1 hours\'',
        [ttlHours.toString()]
      );
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Failed to cleanup idempotency keys', { error });
      throw error;
    }
  }
}

