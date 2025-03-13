import { User } from '../../interfaces/user.interface';
import { PublisherApi } from '../../services/publisher-api';
import { Locale } from '../../enums/locale';
import { ConsumerApi } from '../../services/consumer-api';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    jwt?: string;
    pubapi: PublisherApi;
    conapi: ConsumerApi;
    buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
  }
}
