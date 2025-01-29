import { User } from '../../interfaces/user.interface';
import { StatsWalesApi } from '../../services/stats-wales-api';
import { Locale } from '../../enums/locale';
import { SWConsumerApi } from '../../services/sw-consumer-api';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
        jwt?: string;
        swapi: StatsWalesApi;
        swcapi: SWConsumerApi;
        buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
    }
}
