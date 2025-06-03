import { unstable_createContext, type unstable_MiddlewareFunction } from 'react-router';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { GlobalRole } from '~/enums/global-role';
import { appConfigContext } from '~/context/appContext.server';
import type { UserDTO } from '~/dtos/user/user';
import type { JWTPayloadWithUser } from '~/interfaces/jwt-payload-with-user';
import { logger } from '~/utils/logger.server';

export interface Auth {
  jwt?: string;
  expires?: number;
  user?: UserDTO;
  isAdmin: boolean;
  isDeveloper: boolean;
  isAuthenticated: boolean;
}

const initialContext: Auth = {
  isAdmin: false,
  isDeveloper: false,
  isAuthenticated: false
};

export const authContext = unstable_createContext<Auth>(initialContext);

/*
 * This middleware only cares about checking authentication
 * and updating the authContext with user and permissions.
 *
 * Authenticated routes should use the ensureAuthenticated middleware downstream
 */
export const authMiddleware: unstable_MiddlewareFunction = ({ context, request }) => {
  const config = context.get(appConfigContext);
  const cookiesHeader = request.headers.get('Cookie');
  try {
    if (!cookiesHeader) {
      throw new Error('Cookie header not set');
    }
    const { jwt: token } = parse(cookiesHeader);

    if (!token) {
      throw new Error('JWT cookie not found');
    }

    const secret = config.auth.jwt.secret;
    let decoded: JWTPayloadWithUser | null = null;
    try {
      decoded = jwt.verify(token, secret) as JWTPayloadWithUser;
    } catch {
      throw new Error('Error decoding JWT');
    }

    if (!decoded) {
      throw new Error('Unable to verify JWT token');
    }

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      throw new Error('JWT token has expired');
    }

    // store the token string in the context as we need it for Authorization header in API requests
    const auth: Auth = {
      jwt: token,
      expires: decoded.exp,
      user: decoded.user,
      isAdmin: !!decoded.user?.global_roles.includes(GlobalRole.ServiceAdmin),
      isDeveloper: !!decoded.user?.global_roles.includes(GlobalRole.Developer),
      isAuthenticated: true
    };

    context.set(authContext, auth);
  } catch (err: any) {
    logger.info(err.message);
    context.set(authContext, initialContext);
  }
};
