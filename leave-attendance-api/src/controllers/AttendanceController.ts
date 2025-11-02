import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AttendanceService } from '../services/AttendanceService';
import logger from '../lib/logger';

export class AttendanceController {
  private service: AttendanceService;

  constructor() {
    this.service = new AttendanceService();
  }

  clockIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const { lat, lng, source } = req.body;

      const log = await this.service.clockIn(user.userId, lat, lng, source || 'MOBILE');

      logger.info('User clocked in', { userId: user.userId, logId: log.id });
      res.status(201).json({ data: log });
    } catch (error: any) {
      logger.error('Clock in failed', { error: error.message });

      if (error.message === 'ALREADY_CLOCKED_IN') {
        res.status(400).json({
          code: 'ALREADY_CLOCKED_IN',
          message: 'Already clocked in today',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (error.message === 'GEO_OUT_OF_RANGE') {
        res.status(400).json({
          code: 'GEO_OUT_OF_RANGE',
          message: 'Location is outside the allowed area',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to clock in',
        timestamp: new Date().toISOString(),
      });
    }
  };

  clockOut = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      await this.service.clockOut(user.userId);

      logger.info('User clocked out', { userId: user.userId });
      res.json({ success: true });
    } catch (error: any) {
      logger.error('Clock out failed', { error: error.message });

      if (error.message === 'CLOCK_OUT_MISSING_IN') {
        res.status(400).json({
          code: 'CLOCK_OUT_MISSING_IN',
          message: 'No clock in found for today',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to clock out',
        timestamp: new Date().toISOString(),
      });
    }
  };

  getTodayStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      const status = await this.service.getTodayStatus(user.userId);
      res.json({ data: status });
    } catch (error: any) {
      logger.error('Failed to get today status', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve attendance status',
        timestamp: new Date().toISOString(),
      });
    }
  };

  listLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.query.user_id as string | undefined;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;

      const result = await this.service.getLogs(userId, from, to, { page, size });
      res.setHeader('X-Total-Count', result.total.toString());
      res.json(result);
    } catch (error: any) {
      logger.error('Failed to list logs', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve attendance logs',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

