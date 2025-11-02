import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '10m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8082';
const TOKEN = __ENV.TOKEN || 'test-token';
const USER_ID = __ENV.USER_ID || 'test-user-id';

export default function () {
  // Test health check (no auth required)
  const healthRes = http.get(`${BASE_URL}/healthz`);
  const healthCheck = check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(!healthCheck);

  sleep(1);

  // Test readiness check (no auth required)
  const readyRes = http.get(`${BASE_URL}/readyz`);
  const readyCheck = check(readyRes, {
    'readiness check status is 200': (r) => r.status === 200,
  });
  errorRate.add(!readyCheck);

  sleep(1);

  // Test authenticated endpoint with mock token
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
  };

  const balanceRes = http.get(`${BASE_URL}/api/v1/leave/balance?user_id=${USER_ID}`, { headers });
  const balanceCheck = check(balanceRes, {
    'balance endpoint returns response': (r) => r.status !== 500,
  });
  errorRate.add(!balanceCheck);

  sleep(1);

  // Test leave requests list
  const requestsRes = http.get(`${BASE_URL}/api/v1/leave/requests?page=1&size=20`, { headers });
  const requestsCheck = check(requestsRes, {
    'requests endpoint returns response': (r) => r.status !== 500,
  });
  errorRate.add(!requestsCheck);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'tests/perf/reports/k6-summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

