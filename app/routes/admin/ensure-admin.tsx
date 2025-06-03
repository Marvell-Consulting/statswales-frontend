import { Outlet } from 'react-router';
import { ensureAdmin } from '~/middleware/ensure-admin';
import { noCache } from '~/middleware/no-cache';

export const unstable_middleware = [ensureAdmin, noCache];

export default Outlet;
