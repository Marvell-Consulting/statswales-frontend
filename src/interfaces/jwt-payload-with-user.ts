import { JwtPayload } from 'jsonwebtoken';

import { User } from './user.interface';

export interface JWTPayloadWithUser extends JwtPayload {
    user?: User;
}
