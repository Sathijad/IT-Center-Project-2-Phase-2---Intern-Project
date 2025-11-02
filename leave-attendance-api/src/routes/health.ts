import { Router } from 'express';
import { isJwksReachable } from '../lib/jwksClient';
import logger from '../lib/logger';
import { checkConnection as checkDbConnection } from '../lib/db';

const router = Router();

// GET /healthz - Health check (no dependencies)
router.get('/healthz', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'leave-attendance-api',
  });
});

// GET /readyz - Readiness check (DB + JWKS)
router.get('/readyz', async (_req, res) => {
  const checks: Record<string, boolean> = {};
  let allHealthy = true;

  // Check database
  try {
    checks.database = await checkDbConnection();
    if (!checks.database) allHealthy = false;
  } catch (error) {
    checks.database = false;
    allHealthy = false;
    logger.error('Database readiness check failed', { error });
  }

  // Check Cognito JWKS
  try {
    checks.jwks = await isJwksReachable();
    if (!checks.jwks) allHealthy = false;
  } catch (error) {
    checks.jwks = false;
    allHealthy = false;
    logger.error('JWKS readiness check failed', { error });
  }

  const status = allHealthy ? 200 : 503;
  res.status(status).json({
    status: allHealthy ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;

