import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports', outputName: 'report.xml' }]],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html', 'text']
};

export default config;
