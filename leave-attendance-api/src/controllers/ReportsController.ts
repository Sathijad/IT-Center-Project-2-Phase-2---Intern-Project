import { Request, Response } from 'express';
import { getPool } from '../lib/db';
import logger from '../lib/logger';

export class ReportsController {
  getLeaveSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const range = (req.query.range as string) || '30'; // days
      const teamId = req.query.team_id as string | undefined;

      const pool = getPool();
      
      // Calculate date range
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(range));

      let query = `
        SELECT 
          lr.status,
          COUNT(*) as count,
          SUM(CASE WHEN lr.half_day IS NOT NULL THEN 0.5 
                   WHEN lr.start_date = lr.end_date THEN 1
                   ELSE EXTRACT(DAY FROM (lr.end_date - lr.start_date + 1)) END) as total_days,
          COUNT(CASE WHEN lr.status = 'APPROVED' THEN 1 END) as approved_count,
          COUNT(CASE WHEN lr.status = 'REJECTED' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN lr.status = 'PENDING' THEN 1 END) as pending_count
        FROM leave_requests lr
        WHERE lr.created_at >= $1
      `;

      const params: any[] = [fromDate];

      if (teamId) {
        query += ' AND lr.user_id IN (SELECT user_id FROM team_members WHERE team_id = $2)';
        params.push(teamId);
      }

      query += ' GROUP BY lr.status';

      const result = await pool.query(query, params);

      const summary = {
        totalRequests: result.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0),
        approvedCount: result.rows.find((r: any) => r.status === 'APPROVED')?.approved_count || 0,
        rejectedCount: result.rows.find((r: any) => r.status === 'REJECTED')?.rejected_count || 0,
        pendingCount: result.rows.find((r: any) => r.status === 'PENDING')?.pending_count || 0,
        totalDays: result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.total_days || 0), 0),
        approvalRate: 0,
        ranges: result.rows,
      };

      if (summary.totalRequests > 0) {
        summary.approvalRate = (summary.approvedCount / summary.totalRequests) * 100;
      }

      res.json({ data: summary });
    } catch (error: any) {
      logger.error('Failed to generate report', { error: error.message });
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate leave summary',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

