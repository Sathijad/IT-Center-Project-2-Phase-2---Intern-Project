import { Request, Response } from 'express';
import { MsGraphService } from '../services/MsGraphService';
import logger from '../lib/logger';

export class IntegrationsController {
  private service: MsGraphService;

  constructor() {
    this.service = new MsGraphService();
  }

  syncCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, start_date, end_date, reason } = req.body;

      const result = await this.service.syncCalendar(
        user_id,
        new Date(start_date),
        new Date(end_date),
        reason
      );

      if (result.success) {
        logger.info('Calendar sync completed', { userId: user_id });
        res.json({ success: true });
      } else {
        res.status(500).json({
          code: 'SYNC_FAILED',
          message: result.error || 'Calendar sync failed',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      logger.error('Calendar sync failed', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to sync calendar',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

