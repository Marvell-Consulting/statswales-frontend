import { merge } from 'lodash-es';

import type { DeepPartial } from '../@types/deep-partial';

import type { AppConfig } from './app-config.interface';
import { getDefaultConfig } from './envs/default';

export function defineConfig(config: DeepPartial<AppConfig>): AppConfig {
  return merge({}, getDefaultConfig(), config);
}
