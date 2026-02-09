// Mock the config module before importing anything else
jest.mock('../../src/shared/config', () => ({
  config: {
    env: 'local' // Use string literal to avoid circular dependency
  }
}));

import { featureFlaggingDisabled, isFeatureEnabled } from '../../src/shared/utils/feature-flags';
import { FeatureFlag } from '../../src/shared/enums/feature-flag';
import { config } from '../../src/shared/config';
import { AppEnv } from '../../src/shared/config/env.enum';

describe('featureFlaggingDisabled', () => {
  const originalEnv = config.env;

  afterEach(() => {
    config.env = originalEnv;
  });

  it('should return true in Local environment', () => {
    config.env = AppEnv.Local;
    expect(featureFlaggingDisabled()).toBe(true);
  });

  it('should return true in Ci environment', () => {
    config.env = AppEnv.Ci;
    expect(featureFlaggingDisabled()).toBe(true);
  });

  it('should return false in Staging environment', () => {
    config.env = AppEnv.Staging;
    expect(featureFlaggingDisabled()).toBe(false);
  });

  it('should return false in Production environment', () => {
    config.env = AppEnv.Prod;
    expect(featureFlaggingDisabled()).toBe(false);
  });
});

describe('isFeatureEnabled', () => {
  const originalEnv = config.env;

  beforeEach(() => {
    // Set to staging so feature flagging is enabled
    config.env = AppEnv.Staging;
  });

  afterEach(() => {
    config.env = originalEnv;
  });

  describe('when feature flagging is disabled', () => {
    it('should always return true', () => {
      config.env = AppEnv.Local;
      const params = new URLSearchParams('feature=other');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });
  });

  describe('with URLSearchParams', () => {
    it('should return true when feature flag matches', () => {
      const params = new URLSearchParams('feature=example');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return false when feature flag does not match', () => {
      const params = new URLSearchParams('feature=analytics');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return false when feature param is missing', () => {
      const params = new URLSearchParams('other=value');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return false when params are empty', () => {
      const params = new URLSearchParams('');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return true when feature flag is in comma-separated list', () => {
      const params = new URLSearchParams('feature=analytics,example,reporting');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should handle whitespace in comma-separated list', () => {
      const params = new URLSearchParams('feature=analytics, example , reporting');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return false when feature flag is not in comma-separated list', () => {
      const params = new URLSearchParams('feature=analytics,reporting');
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });
  });

  describe('with Record object (Express query)', () => {
    it('should return true when feature flag matches string value', () => {
      const params = { feature: 'example' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return false when feature flag does not match string value', () => {
      const params = { feature: 'analytics' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return false when feature param is missing', () => {
      const params = { other: 'value' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return false when params are empty', () => {
      const params = {};
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return true when feature flag is in comma-separated string', () => {
      const params = { feature: 'analytics,example,reporting' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should handle whitespace in comma-separated string', () => {
      const params = { feature: 'analytics, example , reporting' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return false when feature flag is not in comma-separated string', () => {
      const params = { feature: 'analytics,reporting' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should return true when feature flag is in array of strings', () => {
      const params = { feature: ['analytics', 'example', 'reporting'] };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return true when feature flag is in comma-separated string within array', () => {
      const params = { feature: ['analytics,example', 'reporting'] };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should return false when feature flag is not in array', () => {
      const params = { feature: ['analytics', 'reporting'] };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle non-string values in feature param', () => {
      const params = { feature: 123 as any };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle null value in feature param', () => {
      const params = { feature: null as any };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle undefined value in feature param', () => {
      const params = { feature: undefined };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string in feature param', () => {
      const params = { feature: '' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle whitespace-only string in feature param', () => {
      const params = { feature: '   ' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle array with empty strings', () => {
      const params = { feature: ['', 'example', ''] };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });

    it('should be case-sensitive', () => {
      const params = { feature: 'Example' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(false);
    });

    it('should handle multiple query params from real Express request', () => {
      const params = { feature: 'example', keywords: 'test', page: '1' };
      expect(isFeatureEnabled(params, FeatureFlag.Example)).toBe(true);
    });
  });
});
