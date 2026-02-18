import { config } from '../config';
import { AppEnv } from '../config/env.enum';
import { FeatureFlag } from '../enums/feature-flag';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = URLSearchParams | Record<string, any>;

export const FEATURE_FLAG_COOKIE = 'features';

export function featureFlaggingDisabled(): boolean {
  // Disable feature flagging in non-production environments (only active in staging and production)
  return ![AppEnv.Prod, AppEnv.Staging].includes(config.env);
}

// Parse a comma-separated feature flag cookie value into an array of flag strings
export function parseFlagCookie(cookieValue: string | undefined): string[] {
  if (!cookieValue) return [];
  return cookieValue
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

// Merge flags extracted from query params into an existing set, returning a sorted unique list
export function mergeFlags(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])].sort();
}

// Extract the list of enabled flag strings from query params (does not check featureFlaggingDisabled)
export function extractFlagsFromParams(params: QueryParams): string[] {
  if (params instanceof URLSearchParams) {
    const feature = params.get('feature');
    if (!feature) return [];
    return feature
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }

  const feature = params.feature;
  if (typeof feature === 'string') {
    return feature
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }

  if (Array.isArray(feature)) {
    return feature.flatMap((f) =>
      typeof f === 'string'
        ? f
            .split(',')
            .map((str) => str.trim())
            .filter(Boolean)
        : []
    );
  }

  return [];
}

// check if a feature is enabled via query parameters or cookie, e.g.
// ?feature=search
// ?feature=search,analytics
// ?feature=search&feature=analytics
// cookieValue is the raw value of the FEATURE_FLAG_COOKIE cookie
export function isFeatureEnabled(params: QueryParams, flag: FeatureFlag, cookieValue?: string): boolean {
  if (featureFlaggingDisabled()) return true;

  const fromParams = extractFlagsFromParams(params);
  if (fromParams.includes(flag)) return true;

  const fromCookie = parseFlagCookie(cookieValue);
  return fromCookie.includes(flag);
}
