import { PolicyService } from '../../../src/services/PolicyService';
import { LeaveRepository } from '../../../src/repositories/LeaveRepository';

// Mock the repository
jest.mock('../../../src/repositories/LeaveRepository');

describe('PolicyService', () => {
  let service: PolicyService;
  let mockRepository: jest.Mocked<LeaveRepository>;

  beforeEach(() => {
    mockRepository = new LeaveRepository() as jest.Mocked<LeaveRepository>;
    service = new PolicyService();
    // Access private repository via any type assertion
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateLeaveDays', () => {
    it('should return 0.5 for half day', () => {
      const startDate = new Date('2025-11-15');
      const endDate = new Date('2025-11-15');
      const result = service.calculateLeaveDays(startDate, endDate, 'AM');
      expect(result).toBe(0.5);
    });

    it('should return 1 for single day without half day', () => {
      const startDate = new Date('2025-11-15');
      const endDate = new Date('2025-11-15');
      const result = service.calculateLeaveDays(startDate, endDate);
      expect(result).toBe(1);
    });

    it('should calculate multiple business days correctly', () => {
      const startDate = new Date('2025-11-15'); // Saturday
      const endDate = new Date('2025-11-17'); // Monday
      const result = service.calculateLeaveDays(startDate, endDate);
      expect(result).toBeGreaterThan(1);
    });
  });

  describe('getPolicyById', () => {
    it('should return policy by id', async () => {
      const mockPolicy = {
        id: 'policy-1',
        type: 'ANNUAL' as const,
        maxDays: 20,
        carryForward: true,
        accrual: 'YEARLY' as const,
        minNoticeDays: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.getPolicyById.mockResolvedValue(mockPolicy as any);

      const result = await service.getPolicyById('policy-1');

      expect(result).toEqual(mockPolicy);
      expect(mockRepository.getPolicyById).toHaveBeenCalledWith('policy-1');
    });

    it('should return null if policy not found', async () => {
      mockRepository.getPolicyById.mockResolvedValue(null);

      const result = await service.getPolicyById('non-existent');

      expect(result).toBeNull();
    });
  });
});

