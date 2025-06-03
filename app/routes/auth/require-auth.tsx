import { Outlet } from 'react-router';
import { ensureAuthenticated } from '~/middleware/ensure-authenticated';
import { publisherApiMiddleware } from '~/middleware/publisher-api.server';

export const unstable_middleware = [ensureAuthenticated, publisherApiMiddleware];

export default Outlet;
