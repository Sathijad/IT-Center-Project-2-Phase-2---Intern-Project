export interface User {
  userId: string;
  email?: string;
  groups?: string[];
  username?: string;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  policyId: string;
  balanceDays: number;
  updatedAt: string;
  policyType?: string;
  policyMaxDays?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  policyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  halfDay?: 'AM' | 'PM';
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user_name?: string;
  user_email?: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  durationMinutes?: number;
  lat?: number;
  lng?: number;
  source: 'MOBILE' | 'WEB' | 'ADMIN';
  createdAt: string;
}

export interface TodayStatus {
  status: 'NOT_STARTED' | 'CLOCKED_IN' | 'CLOCKED_OUT';
  log?: AttendanceLog;
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

