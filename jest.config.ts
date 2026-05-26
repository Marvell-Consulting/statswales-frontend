import type { Config } from 'jest';
import { createJsWithTsPreset } from 'ts-jest';

const config: Config = {
  ...createJsWithTsPreset({ tsconfig: 'tsconfig.test.json' }),
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['/node_modules/(?!(marked|nanoid|until-async|jsdom|parse5)/)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true,
  reporters: ['default', ['jest-junit', { outputDirectory: 'coverage/test-report', outputName: 'junit-report.xml' }]],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/tests-e2e/'],
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['cobertura', 'lcov', 'html', 'text'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/tests-e2e/',
    '/src/controllers/datalake.ts',
    '/src/config/envs/'
  ],
  // Thresholds set ~2% below current coverage to prevent regression. See #541.
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 19,
      functions: 24,
      lines: 33
    }
  },
  setupFiles: ['<rootDir>/tests/.jest/set-env-vars.ts']
};

export default config;
