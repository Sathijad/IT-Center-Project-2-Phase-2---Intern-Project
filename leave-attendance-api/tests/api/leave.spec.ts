import request from 'supertest';
import { createApp } from '../../src/app';
import { createPool } from '../../src/lib/db';

// Mock database
jest.mock('../../src/lib/db', () => ({
  createPool: jest.fn(),
  getPool: jest.fn(),
  closePool: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

const app = createApp();

describe('Leave API', () => {
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    };
    (require('../../src/lib/db').getPool as jest.Mock).mockReturnValue(mockPool);
  });

  describe('GET /api/v1/leave/balance', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/leave/balance?user_id=test-user')
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/leave/requests', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/leave/requests')
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/leave/requests', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/leave/requests')
        .send({
          policy_id: 'test-policy',
          start_date: '2025-11-15',
          end_date: '2025-11-17',
        })
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/v1/leave/requests/:id', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .patch('/api/v1/leave/requests/test-id')
        .send({ status: 'APPROVED' })
        .expect(401);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});

describe('Health Checks', () => {
  describe('GET /healthz', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/healthz')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('leave-attendance-api');
    });
  });

  describe('GET /readyz', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/readyz')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
    });
  });
});

