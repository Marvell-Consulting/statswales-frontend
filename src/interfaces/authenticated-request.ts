import { User } from './user.interface';

export interface AuthenticatedRequest {
    user?: User;
    jwt?: string;
}
