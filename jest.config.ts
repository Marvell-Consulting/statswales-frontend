import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage/test-report', outputName: 'junit-report.xml' }]],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/tests-e2e/'],
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html', 'text'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/tests-e2e/', '/src/controllers/datalake.ts', '/src/config/envs/'],
  setupFiles: ['<rootDir>/tests/.jest/set-env-vars.ts']
};

export default config;
