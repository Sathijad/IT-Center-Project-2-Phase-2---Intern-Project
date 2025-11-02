import { Router } from 'express';
import { correlationMiddleware } from '../middleware/correlation';
import leaveRoutes from './leave';
import attendanceRoutes from './attendance';
import integrationsRoutes from './integrations';
import reportsRoutes from './reports';
import healthRoutes from './health';

const router = Router();

// Apply correlation ID middleware to all routes
router.use(correlationMiddleware);

// Health checks (no auth required)
router.use('/', healthRoutes);

// API v1 routes (require auth)
const v1Router = Router();
v1Router.use('/leave', leaveRoutes);
v1Router.use('/attendance', attendanceRoutes);
v1Router.use('/integrations', integrationsRoutes);
v1Router.use('/reports', reportsRoutes);

const apiVersion = process.env.API_VERSION || 'v1';
router.use(`/api/${apiVersion}`, v1Router);

export default router;

