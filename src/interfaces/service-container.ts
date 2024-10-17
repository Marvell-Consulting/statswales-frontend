import { Locale } from '../enums/locale';
import { StatsWalesApi } from '../services/stats-wales-api';

export interface ServiceContainer {
    swapi: StatsWalesApi;
    buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
}
