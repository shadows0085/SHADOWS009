module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['./tests/setup.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 20000
};
