import { Locale } from '../enums/locale';
import { PublishService } from '../services/publish.service';
import { StatsWalesApi } from '../services/stats-wales-api';

export interface ServiceContainer {
    swapi: StatsWalesApi;
    publish: PublishService;
    buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
}
