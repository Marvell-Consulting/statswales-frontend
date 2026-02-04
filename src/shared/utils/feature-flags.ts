import { config } from '../config';
import { AppEnv } from '../config/env.enum';
import { FeatureFlag } from '../enums/feature-flag';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = URLSearchParams | Record<string, any>;

export function featureFlaggingDisabled(): boolean {
  // Disable feature flagging in non-production environments (only active in staging and production)
  return ![AppEnv.Prod, AppEnv.Staging].includes(config.env);
}

// check if a feature is enabled via query parameters, e.g.
// ?feature=search
// ?feature=search,analytics
// ?feature=search&feature=analytics
export function isFeatureEnabled(params: QueryParams, flag: FeatureFlag): boolean {
  if (featureFlaggingDisabled()) return true;

  if (params instanceof URLSearchParams) {
    const feature = params.get('feature');
    if (!feature) return false;

    return feature
      .split(',')
      .map((f) => f.trim())
      .includes(flag);
  }

  const feature = params.feature;
  if (typeof feature === 'string') {
    return feature
      .split(',')
      .map((f) => f.trim())
      .includes(flag);
  }

  if (Array.isArray(feature)) {
    return feature.some(
      (f) =>
        typeof f === 'string' &&
        f
          .split(',')
          .map((str) => str.trim())
          .includes(flag)
    );
  }

  return false;
}
