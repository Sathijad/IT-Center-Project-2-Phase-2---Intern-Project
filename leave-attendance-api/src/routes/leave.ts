import { Router } from 'express';
import { LeaveController } from '../controllers/LeaveController';
import { authMiddleware } from '../middleware/auth';
import { requireRole, requireOwnData } from '../middleware/rbac';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();
const controller = new LeaveController();

// GET /balance - EMPLOYEE (own) | ADMIN (any)
router.get('/balance', authMiddleware, requireOwnData, controller.getBalance);

// GET /requests - EMPLOYEE (own) | ADMIN (all)
router.get('/requests', authMiddleware, requireOwnData, controller.listRequests);

// POST /requests - EMPLOYEE (create own)
router.post('/requests', authMiddleware, requireRole(['EMPLOYEE', 'ADMIN']), idempotencyMiddleware, controller.createRequest);

// PATCH /requests/:id - ADMIN only (approve/reject/cancel)
router.patch('/requests/:id', authMiddleware, requireRole(['ADMIN']), controller.updateRequest);

export default router;

