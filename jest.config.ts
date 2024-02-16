import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  reporters: [
    [
      'jest-junit',
      {
        outputDirectory: './coverage/test-report',
        outputName: 'test-report.xml'
      }
    ]
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html', 'text']
};

export default config;
