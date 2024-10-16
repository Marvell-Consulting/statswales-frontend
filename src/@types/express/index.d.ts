import { AuthenticatedRequest } from '../../interfaces/authenticated-request';
import { ServiceContainer } from '../../interfaces/service-container';

declare module 'express-serve-static-core' {
    interface Request extends ServiceContainer, AuthenticatedRequest {}
}
