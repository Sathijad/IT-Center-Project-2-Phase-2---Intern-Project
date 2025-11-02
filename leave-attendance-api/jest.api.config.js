const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/tests/api/**/*.spec.ts'],
  displayName: 'api',
  testTimeout: 10000,
};

