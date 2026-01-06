import express, { Router, Request, Response, NextFunction } from 'express';

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
  similarDatasets
} from '../controllers/admin';
import { ensureAdmin } from '../middleware/ensure-admin';
import { flashMessages } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';

export const admin = Router();
const bodyParser = express.urlencoded({ extended: true });

admin.use(ensureAdmin, noCache, flashMessages);

admin.use('/group', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'groups';
  next();
});

admin.get('/group', listUserGroups);

admin.get('/group/create', provideGroupName);
admin.post('/group/create', bodyParser, provideGroupName);

admin.get('/group/:userGroupId', fetchUserGroup, viewGroup);

admin.get('/group/:userGroupId/name', fetchUserGroup, provideGroupName);
admin.post('/group/:userGroupId/name', fetchUserGroup, bodyParser, provideGroupName);

admin.get('/group/:userGroupId/organisation', fetchUserGroup, provideOrganisation);
admin.post('/group/:userGroupId/organisation', fetchUserGroup, bodyParser, provideOrganisation);

admin.get('/group/:userGroupId/email', fetchUserGroup, provideGroupEmail);
admin.post('/group/:userGroupId/email', fetchUserGroup, bodyParser, provideGroupEmail);

admin.get('/group/:userGroupId/status', fetchUserGroup, groupStatus);
admin.post('/group/:userGroupId/status', fetchUserGroup, bodyParser, groupStatus);

admin.use('/user', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'users';
  next();
});

admin.get('/dashboard', dashboard);
admin.get('/similar/datasets', similarDatasets);
admin.get('/user', listUsers);

admin.get('/user/create', createUser);
admin.post('/user/create', bodyParser, createUser);

admin.get('/user/:userId', fetchUser, viewUser);
admin.post('/user/:userId', fetchUser, bodyParser, viewUser);

admin.get('/user/:userId/roles', fetchUser, editUserRoles);
admin.post('/user/:userId/roles', fetchUser, bodyParser, editUserRoles);

admin.get('/user/:userId/status', fetchUser, userStatus);
admin.post('/user/:userId/status', fetchUser, bodyParser, userStatus);
