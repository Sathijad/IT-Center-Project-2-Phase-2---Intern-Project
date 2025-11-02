import { BalanceService } from '../../../src/services/BalanceService';
import { LeaveRepository } from '../../../src/repositories/LeaveRepository';

jest.mock('../../../src/repositories/LeaveRepository');

describe('BalanceService', () => {
  let service: BalanceService;
  let mockRepository: jest.Mocked<LeaveRepository>;

  beforeEach(() => {
    mockRepository = new LeaveRepository() as jest.Mocked<LeaveRepository>;
    service = new BalanceService();
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalances', () => {
    it('should return balances for user', async () => {
      const mockBalances = [
        {
          id: 'bal-1',
          user_id: 'user-1',
          policy_id: 'policy-1',
          balance_days: 15.5,
          policy_type: 'ANNUAL',
          max_days: 20,
        },
      ];

      mockRepository.getBalancesByUserId.mockResolvedValue(mockBalances as any);

      const result = await service.getBalances('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('policyType', 'ANNUAL');
      expect(mockRepository.getBalancesByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('deductBalance', () => {
    it('should deduct balance successfully', async () => {
      const newBalance = 10.5;
      mockRepository.deductBalance.mockResolvedValue(newBalance);

      const result = await service.deductBalance('user-1', 'policy-1', 5);

      expect(result).toBe(newBalance);
      expect(mockRepository.deductBalance).toHaveBeenCalledWith('user-1', 'policy-1', 5);
    });

    it('should throw error on failure', async () => {
      mockRepository.deductBalance.mockRejectedValue(new Error('Balance not found'));

      await expect(service.deductBalance('user-1', 'policy-1', 5)).rejects.toThrow();
    });
  });
});

