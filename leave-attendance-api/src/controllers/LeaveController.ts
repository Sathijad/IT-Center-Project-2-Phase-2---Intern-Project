import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { LeaveRepository } from '../repositories/LeaveRepository';
import { BalanceService } from '../services/BalanceService';
import { PolicyService } from '../services/PolicyService';
import { SesService } from '../services/SesService';
import logger from '../lib/logger';

export class LeaveController {
  private repository: LeaveRepository;
  private balanceService: BalanceService;
  private policyService: PolicyService;
  private sesService: SesService;

  constructor() {
    this.repository = new LeaveRepository();
    this.balanceService = new BalanceService();
    this.policyService = new PolicyService();
    this.sesService = new SesService();
  }

  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.user_id as string;
      const balances = await this.balanceService.getBalances(userId);
      res.json({ data: balances });
    } catch (error: any) {
      logger.error('Failed to get balance', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve leave balance',
        timestamp: new Date().toISOString(),
      });
    }
  };

  listRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.user_id as string | undefined;
      const status = req.query.status as string | undefined;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;

      const result = await this.repository.getRequests(userId, status, from, to, { page, size });
      res.setHeader('X-Total-Count', result.total.toString());
      res.json(result);
    } catch (error: any) {
      logger.error('Failed to list requests', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve leave requests',
        timestamp: new Date().toISOString(),
      });
    }
  };

  createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      const { policy_id, start_date, end_date, half_day, reason } = req.body;

      // Validate request
      const validation = await this.policyService.validateLeaveRequest(
        user.userId,
        policy_id,
        new Date(start_date),
        new Date(end_date),
        half_day
      );

      if (!validation.valid) {
        res.status(400).json({
          code: validation.errorCode || 'VALIDATION_ERROR',
          message: validation.errors.join(', '),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create request
      const request = await this.repository.createRequest({
        userId: user.userId,
        policyId: policy_id,
        status: 'PENDING',
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        halfDay: half_day,
        reason: reason,
      });

      // Create audit log
      await this.repository.createAudit({
        requestId: request.id,
        action: 'CREATED',
        actorId: user.userId,
      });

      // Send notification (async, don't wait)
      this.sesService
        .sendLeaveNotification(user.email!, 'Leave Request Submitted', `Your leave request has been submitted.`, 'requested')
        .catch((err) => logger.error('Failed to send notification', { err }));

      logger.info('Leave request created', { requestId: request.id, userId: user.userId });
      res.status(201).json({ data: request });
    } catch (error: any) {
      logger.error('Failed to create request', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create leave request',
        timestamp: new Date().toISOString(),
      });
    }
  };

  updateRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { id } = req.params;
      const { status, notes } = req.body;

      // Get existing request
      const existingRequest = await this.repository.getRequestById(id);
      if (!existingRequest) {
        res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Leave request not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate status
      if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
        res.status(400).json({
          code: 'INVALID_STATUS',
          message: 'Invalid status',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update request
      await this.repository.updateRequestStatus(id, status, user.userId, new Date());

      // Create audit log
      await this.repository.createAudit({
        requestId: id,
        action: status,
        actorId: user.userId,
        notes: notes,
      });

      // If approved, deduct balance
      if (status === 'APPROVED') {
        const days = this.policyService.calculateLeaveDays(
          existingRequest.start_date,
          existingRequest.end_date,
          existingRequest.half_day
        );
        await this.balanceService.deductBalance(existingRequest.user_id, existingRequest.policy_id, days);
      }

      // Send notification (async)
      this.sesService
        .sendLeaveNotification(
          (existingRequest as any).user_email,
          `Leave Request ${status}`,
          notes || `Your leave request has been ${status.toLowerCase()}.`,
          status === 'APPROVED' ? 'approved' : 'rejected'
        )
        .catch((err) => logger.error('Failed to send notification', { err }));

      logger.info('Leave request updated', { requestId: id, status, userId: user.userId });
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Failed to update request', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to update leave request',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

