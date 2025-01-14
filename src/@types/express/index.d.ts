import { User } from '../../interfaces/user.interface';
import { StatsWalesApi } from '../../services/stats-wales-api';
import { Locale } from '../../enums/locale';

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
        jwt?: string;
        swapi: StatsWalesApi;
        buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
    }
}
