import { LeaveRepository } from '../repositories/LeaveRepository';
import logger from '../lib/logger';

export class BalanceService {
  private repository: LeaveRepository;

  constructor() {
    this.repository = new LeaveRepository();
  }

  async getBalances(userId: string) {
    const balances = await this.repository.getBalancesByUserId(userId);
    
    // Add policy details to balances
    return balances.map((balance) => ({
      ...balance,
      policyType: (balance as any).policy_type,
      policyMaxDays: (balance as any).max_days,
    }));
  }

  async deductBalance(userId: string, policyId: string, days: number): Promise<number> {
    try {
      const newBalance = await this.repository.deductBalance(userId, policyId, days);
      logger.info('Balance deducted', { userId, policyId, days, newBalance });
      return newBalance;
    } catch (error: any) {
      logger.error('Failed to deduct balance', { userId, policyId, days, error: error.message });
      throw new Error('Failed to deduct balance');
    }
  }

  async accrueBalance(userId: string, policyId: string, days: number): Promise<void> {
    const balance = await this.repository.getBalance(userId, policyId);
    
    if (balance) {
      // Update existing balance
      await this.repository.deductBalance(userId, policyId, -days); // Negative deduction = addition
    } else {
      // Create new balance
      const policy = await this.repository.getPolicyById(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      await this.repository.updateBalance(userId, policyId, days);
    }

    logger.info('Balance accrued', { userId, policyId, days });
  }

  async getBalance(userId: string, policyId: string) {
    return this.repository.getBalance(userId, policyId);
  }
}

