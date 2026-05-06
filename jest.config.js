/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
};
