import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage/test-report', outputName: 'junit-report.xml' }]],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html', 'text'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/src/controllers/datalake.ts', '/src/config/envs/'],
  setupFiles: ['<rootDir>/test/.jest/set-env-vars.ts']
};

export default config;
