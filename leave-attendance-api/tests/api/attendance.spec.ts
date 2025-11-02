import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/lib/db', () => ({
  createPool: jest.fn(),
  getPool: jest.fn(),
  closePool: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

const app = createApp();

describe('Attendance API', () => {
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
    (require('../../src/lib/db').getPool as jest.Mock).mockReturnValue(mockPool);
  });

  describe('GET /api/v1/attendance', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/attendance')
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/attendance/clock-in', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/clock-in')
        .send({})
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/attendance/clock-out', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/clock-out')
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});

