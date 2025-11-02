import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const controller = new ReportsController();

// GET /leave-summary - ADMIN only
router.get('/leave-summary', authMiddleware, requireRole(['ADMIN']), controller.getLeaveSummary);

export default router;

