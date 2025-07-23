import { PublisherApi } from '../../publisher/services/publisher-api';
import { Locale } from '../../shared/enums/locale';
import { ConsumerApi } from '../../consumer/services/consumer-api';
import { UserDTO } from '../../dtos/user/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDTO;
    jwt?: string;
    pubapi: PublisherApi;
    conapi: ConsumerApi;
    buildUrl: (path: string, locale: Locale | string, query?: Record<string, string>) => string;
  }
}
