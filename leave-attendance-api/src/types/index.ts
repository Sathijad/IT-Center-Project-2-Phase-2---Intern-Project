import { Request } from 'express';

export interface JWTPayload {
  sub: string;
  email?: string;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email?: string;
    groups?: string[];
    username?: string;
  };
  correlationId?: string;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  policyId: string;
  balanceDays: number;
  updatedAt: Date;
  policy?: LeavePolicy;
}

export interface LeavePolicy {
  id: string;
  type: 'ANNUAL' | 'CASUAL' | 'SICK' | 'UNPAID';
  maxDays: number;
  carryForward: boolean;
  accrual: 'MONTHLY' | 'YEARLY';
  minNoticeDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  policyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  halfDay?: 'AM' | 'PM';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  policy?: LeavePolicy;
  approver?: any;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  clockIn: Date;
  clockOut?: Date;
  durationMinutes?: number;
  lat?: number;
  lng?: number;
  source: 'MOBILE' | 'WEB' | 'ADMIN';
  createdAt: Date;
  user?: any;
}

export interface LeaveAudit {
  id: string;
  requestId: string;
  action: string;
  actorId: string;
  notes?: string;
  createdAt: Date;
}

export interface IdempotencyKey {
  key: string;
  responseBody: any;
  statusCode: number;
  createdAt: Date;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  errorCode?: string;
}

