import { config } from '../config';
import { AppEnv } from '../config/env.enum';
import { FeatureFlag } from '../enums/feature-flag';

type QueryParams = URLSearchParams | Record<string, any>;

export function featureFlaggingDisabled(): boolean {
  // Disable feature flagging in non-production environments (only active in staging and production)
  return ![AppEnv.Prod, AppEnv.Staging].includes(config.env);
}

// check if a feature is enabled via query parameters
export function isFeatureEnabled(params: QueryParams, flag: FeatureFlag): boolean {
  if (featureFlaggingDisabled()) return true;

  if (params instanceof URLSearchParams) {
    return params.get('feature') === flag;
  }

  const feature = params.feature;
  if (typeof feature === 'string') {
    return feature === flag;
  }

  return false;
}
