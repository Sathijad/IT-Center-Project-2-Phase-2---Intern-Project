import { getPool } from '../lib/db';
import { LeaveRequest, LeaveBalance, LeavePolicy, LeaveAudit, PaginationParams, PaginatedResponse } from '../types';
import logger from '../lib/logger';

export class LeaveRepository {
  // Policies
  async getAllPolicies(): Promise<LeavePolicy[]> {
    const pool = getPool();
    const result = await pool.query<LeavePolicy>('SELECT * FROM leave_policies ORDER BY type');
    return result.rows;
  }

  async getPolicyById(id: string): Promise<LeavePolicy | null> {
    const pool = getPool();
    const result = await pool.query<LeavePolicy>('SELECT * FROM leave_policies WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Balances
  async getBalancesByUserId(userId: string): Promise<LeaveBalance[]> {
    const pool = getPool();
    const result = await pool.query<LeaveBalance>(
      `SELECT lb.*, lp.type as policy_type 
       FROM leave_balances lb 
       JOIN leave_policies lp ON lb.policy_id = lp.id 
       WHERE lb.user_id = $1 
       ORDER BY lp.type`,
      [userId]
    );
    return result.rows;
  }

  async getBalance(userId: string, policyId: string): Promise<LeaveBalance | null> {
    const pool = getPool();
    const result = await pool.query<LeaveBalance>(
      'SELECT * FROM leave_balances WHERE user_id = $1 AND policy_id = $2',
      [userId, policyId]
    );
    return result.rows[0] || null;
  }

  async updateBalance(userId: string, policyId: string, balanceDays: number): Promise<void> {
    const pool = getPool();
    await pool.query(
      `INSERT INTO leave_balances (user_id, policy_id, balance_days) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, policy_id) 
       DO UPDATE SET balance_days = $3, updated_at = NOW()`,
      [userId, policyId, balanceDays]
    );
  }

  async deductBalance(userId: string, policyId: string, days: number): Promise<number> {
    const pool = getPool();
    const result = await pool.query<{ balance_days: number }>(
      `UPDATE leave_balances 
       SET balance_days = balance_days - $1, updated_at = NOW() 
       WHERE user_id = $2 AND policy_id = $3 
       RETURNING balance_days`,
      [days, userId, policyId]
    );

    if (result.rows.length === 0) {
      throw new Error('Balance not found');
    }

    return parseFloat(result.rows[0].balance_days.toString());
  }

  // Requests
  async getRequests(
    userId?: string,
    status?: string,
    from?: string,
    to?: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<LeaveRequest>> {
    const pool = getPool();
    let query = `
      SELECT lr.*, lp.type as policy_type, lp.max_days,
             au.email as user_email, au.first_name || ' ' || au.last_name as user_name,
             approver.email as approver_email, approver.first_name || ' ' || approver.last_name as approver_name
      FROM leave_requests lr
      JOIN leave_policies lp ON lr.policy_id = lp.id
      LEFT JOIN app_users au ON lr.user_id = au.id
      LEFT JOIN app_users approver ON lr.approved_by = approver.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND lr.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (status) {
      query += ` AND lr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (from) {
      query += ` AND lr.end_date >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }

    if (to) {
      query += ` AND lr.start_date <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    query += ' ORDER BY lr.created_at DESC';

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

    const result = await pool.query<LeaveRequest>(query, params);

    return {
      data: result.rows,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getRequestById(id: string): Promise<LeaveRequest | null> {
    const pool = getPool();
    const result = await pool.query<LeaveRequest>(
      `SELECT lr.*, lp.type as policy_type, lp.max_days,
              au.email as user_email, au.first_name || ' ' || au.last_name as user_name,
              approver.email as approver_email, approver.first_name || ' ' || approver.last_name as approver_name
       FROM leave_requests lr
       JOIN leave_policies lp ON lr.policy_id = lp.id
       LEFT JOIN app_users au ON lr.user_id = au.id
       LEFT JOIN app_users approver ON lr.approved_by = approver.id
       WHERE lr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createRequest(request: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const pool = getPool();
    const result = await pool.query<LeaveRequest>(
      `INSERT INTO leave_requests 
       (user_id, policy_id, status, start_date, end_date, half_day, reason) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [request.userId, request.policyId, request.status || 'PENDING', request.startDate, request.endDate, request.halfDay, request.reason]
    );
    return result.rows[0];
  }

  async updateRequestStatus(
    id: string,
    status: string,
    approvedBy?: string,
    approvedAt?: Date
  ): Promise<void> {
    const pool = getPool();
    await pool.query(
      `UPDATE leave_requests 
       SET status = $1, approved_by = $2, approved_at = $3, updated_at = NOW() 
       WHERE id = $4`,
      [status, approvedBy, approvedAt || new Date(), id]
    );
  }

  // Audit
  async createAudit(audit: Partial<LeaveAudit>): Promise<LeaveAudit> {
    const pool = getPool();
    const result = await pool.query<LeaveAudit>(
      'INSERT INTO leave_audit (request_id, action, actor_id, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [audit.requestId, audit.action, audit.actorId, audit.notes]
    );
    return result.rows[0];
  }

  // Overlap checking
  async hasOverlappingRequest(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string
  ): Promise<boolean> {
    const pool = getPool();
    let query = `
      SELECT COUNT(*) FROM leave_requests 
      WHERE user_id = $1 
        AND status IN ('PENDING', 'APPROVED')
        AND (start_date, end_date) OVERLAPS ($2, $3)
    `;
    const params: any[] = [userId, startDate, endDate];

    if (excludeRequestId) {
      query += ' AND id != $4';
      params.push(excludeRequestId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) > 0;
  }
}

