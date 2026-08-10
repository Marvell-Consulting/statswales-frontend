import { Router, Request, Response, NextFunction } from 'express';

import {
  listUserGroups,
  provideGroupName,
  provideOrganisation,
  provideGroupEmail,
  fetchUserGroup,
  fetchUser,
  viewGroup,
  listUsers,
  createUser,
  editUserRoles,
  viewUser,
  userStatus,
  groupStatus,
  dashboard,
  similarDatasets,
  downloadSearchLogs
} from '../controllers/admin';
import { ensureAdmin } from '../middleware/ensure-admin';
import { flashMessages } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';
import { verifyCsrfToken } from '../../shared/middleware/csrf';

export const admin = Router();

admin.use(ensureAdmin, noCache, flashMessages);

admin.use('/group', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'groups';
  next();
});

admin.get('/group', listUserGroups);

admin.get('/group/create', provideGroupName);
admin.post('/group/create', verifyCsrfToken, provideGroupName);

admin.get('/group/:userGroupId', fetchUserGroup, viewGroup);

admin.get('/group/:userGroupId/name', fetchUserGroup, provideGroupName);
admin.post('/group/:userGroupId/name', fetchUserGroup, verifyCsrfToken, provideGroupName);

admin.get('/group/:userGroupId/organisation', fetchUserGroup, provideOrganisation);
admin.post('/group/:userGroupId/organisation', fetchUserGroup, verifyCsrfToken, provideOrganisation);

admin.get('/group/:userGroupId/email', fetchUserGroup, provideGroupEmail);
admin.post('/group/:userGroupId/email', fetchUserGroup, verifyCsrfToken, provideGroupEmail);

admin.get('/group/:userGroupId/status', fetchUserGroup, groupStatus);
admin.post('/group/:userGroupId/status', fetchUserGroup, verifyCsrfToken, groupStatus);

admin.use('/user', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'users';
  next();
});

admin.get('/dashboard', dashboard);
admin.get('/similar/datasets', similarDatasets);
admin.get('/user', listUsers);

admin.get('/user/create', createUser);
admin.post('/user/create', verifyCsrfToken, createUser);

admin.get('/user/:userId', fetchUser, viewUser);
admin.post('/user/:userId', fetchUser, verifyCsrfToken, viewUser);

admin.get('/user/:userId/roles', fetchUser, editUserRoles);
admin.post('/user/:userId/roles', fetchUser, verifyCsrfToken, editUserRoles);

admin.get('/user/:userId/status', fetchUser, userStatus);
admin.post('/user/:userId/status', fetchUser, verifyCsrfToken, userStatus);

admin.get('/search-logs', downloadSearchLogs);
