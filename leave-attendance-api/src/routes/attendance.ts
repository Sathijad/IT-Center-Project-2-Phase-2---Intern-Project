import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireOwnData } from '../middleware/rbac';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();
const controller = new AttendanceController();

// GET /attendance - EMPLOYEE (own) | ADMIN (any)
router.get('/', authMiddleware, requireOwnData, controller.listLogs);

// GET /attendance/today - EMPLOYEE (own status)
router.get('/today', authMiddleware, controller.getTodayStatus);

// POST /attendance/clock-in - EMPLOYEE only
router.post('/clock-in', authMiddleware, requireRole(['EMPLOYEE', 'ADMIN']), idempotencyMiddleware, controller.clockIn);

// POST /attendance/clock-out - EMPLOYEE only
router.post('/clock-out', authMiddleware, requireRole(['EMPLOYEE', 'ADMIN']), controller.clockOut);

export default router;

