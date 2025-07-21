import { JwtPayload } from 'jsonwebtoken';

import { UserDTO } from '../dtos/user/user';

export interface JWTPayloadWithUser extends JwtPayload {
  user?: UserDTO;
}
