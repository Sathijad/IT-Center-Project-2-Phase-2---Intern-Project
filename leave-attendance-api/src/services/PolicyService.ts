import { LeaveRepository } from '../repositories/LeaveRepository';
import { ValidationResult } from '../types';
import logger from '../lib/logger';
import { differenceInBusinessDays, isSameDay, parseISO } from 'date-fns';

export class PolicyService {
  private repository: LeaveRepository;

  constructor() {
    this.repository = new LeaveRepository();
  }

  async validateLeaveRequest(
    userId: string,
    policyId: string,
    startDate: Date,
    endDate: Date,
    halfDay?: string,
    excludeRequestId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Get policy
    const policy = await this.repository.getPolicyById(policyId);
    if (!policy) {
      return {
        valid: false,
        errors: ['Invalid policy'],
        errorCode: 'INVALID_POLICY',
      };
    }

    // Validate date range
    if (endDate < startDate) {
      return {
        valid: false,
        errors: ['End date must be after start date'],
        errorCode: 'INVALID_DATE_RANGE',
      };
    }

    // Check min notice period
    const today = new Date();
    const noticeDays = differenceInBusinessDays(startDate, today);
    if (noticeDays < policy.minNoticeDays) {
      return {
        valid: false,
        errors: [`Minimum notice period is ${policy.minNoticeDays} business days`],
        errorCode: 'INSUFFICIENT_NOTICE',
      };
    }

    // Check overlap
    const hasOverlap = await this.repository.hasOverlappingRequest(
      userId,
      startDate,
      endDate,
      excludeRequestId
    );
    if (hasOverlap) {
      return {
        valid: false,
        errors: ['Leave request overlaps with an existing approved or pending request'],
        errorCode: 'LEAVE_OVERLAP',
      };
    }

    // Check balance
    const balance = await this.repository.getBalance(userId, policyId);
    if (!balance) {
      return {
        valid: false,
        errors: ['Leave balance not found'],
        errorCode: 'BALANCE_NOT_FOUND',
      };
    }

    const requestedDays = this.calculateLeaveDays(startDate, endDate, halfDay);
    if (requestedDays > balance.balanceDays) {
      return {
        valid: false,
        errors: [`Insufficient leave balance. Available: ${balance.balanceDays}, Requested: ${requestedDays}`],
        errorCode: 'INSUFFICIENT_BALANCE',
      };
    }

    return { valid: true, errors: [] };
  }

  calculateLeaveDays(startDate: Date, endDate: Date, halfDay?: string): number {
    if (isSameDay(startDate, endDate)) {
      return halfDay ? 0.5 : 1;
    }

    const businessDays = differenceInBusinessDays(endDate, startDate) + 1;

    // Adjust for half days
    if (halfDay) {
      return businessDays - 0.5;
    }

    return businessDays;
  }

  async getPolicyById(id: string) {
    return this.repository.getPolicyById(id);
  }

  async getAllPolicies() {
    return this.repository.getAllPolicies();
  }
}

