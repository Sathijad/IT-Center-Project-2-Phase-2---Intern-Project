import { Router } from 'express';
import { IntegrationsController } from '../controllers/IntegrationsController';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const controller = new IntegrationsController();

// POST /msgraph/sync - ADMIN only
router.post('/msgraph/sync', authMiddleware, requireRole(['ADMIN']), controller.syncCalendar);

export default router;

