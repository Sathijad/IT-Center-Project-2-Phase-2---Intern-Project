import { getPool } from '../lib/db';
import { AttendanceLog, PaginationParams, PaginatedResponse } from '../types';
import logger from '../lib/logger';

export class AttendanceRepository {
  async getLogs(
    userId?: string,
    from?: string,
    to?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<AttendanceLog>> {
    const pool = getPool();
    let query = `
      SELECT al.*, au.email as user_email, 
             au.first_name || ' ' || au.last_name as user_name
      FROM attendance_logs al
      LEFT JOIN app_users au ON al.user_id = au.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (from) {
      query += ` AND al.clock_in >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }

    if (to) {
      query += ` AND al.clock_in <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    query += ' ORDER BY al.clock_in DESC';

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    const page = pagination?.page || 1;
    const size = pagination?.size || 20;
    const offset = (page - 1) * size;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(size, offset);

    const result = await pool.query<AttendanceLog>(query, params);

    return {
      data: result.rows,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getTodayClockIn(userId: string): Promise<AttendanceLog | null> {
    const pool = getPool();
    const result = await pool.query<AttendanceLog>(
      `SELECT * FROM attendance_logs 
       WHERE user_id = $1 
         AND clock_out IS NULL 
         AND DATE(clock_in) = CURRENT_DATE 
       ORDER BY clock_in DESC 
       LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async clockIn(log: Partial<AttendanceLog>): Promise<AttendanceLog> {
    const pool = getPool();
    const result = await pool.query<AttendanceLog>(
      `INSERT INTO attendance_logs 
       (user_id, clock_in, lat, lng, source) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [log.userId, log.clockIn || new Date(), log.lat, log.lng, log.source || 'MOBILE']
    );
    return result.rows[0];
  }

  async clockOut(logId: string, clockOut: Date, durationMinutes: number): Promise<void> {
    const pool = getPool();
    await pool.query(
      `UPDATE attendance_logs 
       SET clock_out = $1, duration_minutes = $2 
       WHERE id = $3`,
      [clockOut, durationMinutes, logId]
    );
  }

  async getLogById(id: string): Promise<AttendanceLog | null> {
    const pool = getPool();
    const result = await pool.query<AttendanceLog>(
      'SELECT * FROM attendance_logs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

