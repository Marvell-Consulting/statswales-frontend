import { unstable_createContext } from 'react-router';
import { appConfig } from '~/config';
import type { AppConfig } from '~/config/app-config.interface';

export const appConfigContext = unstable_createContext<AppConfig>(appConfig());
