import { AttendanceService } from '../../../src/services/AttendanceService';
import { AttendanceRepository } from '../../../src/repositories/AttendanceRepository';
import { GeoService } from '../../../src/services/GeoService';

jest.mock('../../../src/repositories/AttendanceRepository');
jest.mock('../../../src/services/GeoService');

describe('AttendanceService', () => {
  let service: AttendanceService;
  let mockRepo: jest.Mocked<AttendanceRepository>;
  let mockGeo: jest.Mocked<GeoService>;

  beforeEach(() => {
    mockRepo = new AttendanceRepository() as jest.Mocked<AttendanceRepository>;
    mockGeo = new GeoService() as jest.Mocked<GeoService>;
    service = new AttendanceService();
    (service as any).repository = mockRepo;
    (service as any).geoService = mockGeo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clockIn', () => {
    it('should clock in successfully', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue(null); // No existing clock-in
      mockGeo.validateLocation.mockReturnValue({ valid: true });
      mockRepo.clockIn.mockResolvedValue({
        id: 'log-1',
        user_id: 'user-1',
        clock_in: new Date(),
        source: 'MOBILE',
      } as any);

      const result = await service.clockIn('user-1', -33.8688, 151.2093, 'MOBILE');

      expect(result).toHaveProperty('id', 'log-1');
      expect(mockRepo.clockIn).toHaveBeenCalled();
    });

    it('should throw error if already clocked in', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue({
        id: 'existing-log',
        user_id: 'user-1',
        clock_in: new Date(),
      } as any);

      await expect(service.clockIn('user-1')).rejects.toThrow('ALREADY_CLOCKED_IN');
    });

    it('should throw error if geo validation fails', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue(null);
      mockGeo.validateLocation.mockReturnValue({ valid: false, error: 'Out of range' });

      await expect(service.clockIn('user-1', 0, 0)).rejects.toThrow('GEO_OUT_OF_RANGE');
    });
  });

  describe('clockOut', () => {
    it('should clock out successfully', async () => {
      const clockInTime = new Date('2025-11-02T09:00:00Z');
      mockRepo.getTodayClockIn.mockResolvedValue({
        id: 'log-1',
        user_id: 'user-1',
        clock_in: clockInTime,
      } as any);
      mockRepo.clockOut.mockResolvedValue(undefined);

      await service.clockOut('user-1');

      expect(mockRepo.clockOut).toHaveBeenCalled();
    });

    it('should throw error if no clock-in found', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue(null);

      await expect(service.clockOut('user-1')).rejects.toThrow('CLOCK_OUT_MISSING_IN');
    });
  });

  describe('getTodayStatus', () => {
    it('should return NOT_STARTED when no clock-in', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue(null);

      const result = await service.getTodayStatus('user-1');

      expect(result.status).toBe('NOT_STARTED');
    });

    it('should return CLOCKED_IN when not clocked out', async () => {
      mockRepo.getTodayClockIn.mockResolvedValue({
        id: 'log-1',
        clock_in: new Date(),
      } as any);

      const result = await service.getTodayStatus('user-1');

      expect(result.status).toBe('CLOCKED_IN');
    });
  });
});

