import type { JwtPayload } from 'jsonwebtoken';

import type { UserDTO } from '../dtos/user/user';

export interface JWTPayloadWithUser extends JwtPayload {
  user?: UserDTO;
}
