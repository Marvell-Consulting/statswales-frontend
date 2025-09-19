import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

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
  groupStatus
} from '../controllers/admin';
import { ensureAdmin } from '../middleware/ensure-admin';
import { flashMessages } from '../../shared/middleware/flash';
import { noCache } from '../../shared/middleware/no-cache';

export const admin = Router();

const upload = multer({ storage: multer.memoryStorage() });

admin.use(ensureAdmin, noCache, flashMessages);

admin.use('/group', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'groups';
  next();
});

admin.get('/group', listUserGroups);

admin.get('/group/create', provideGroupName);
admin.post('/group/create', upload.none(), provideGroupName);

admin.get('/group/:userGroupId', fetchUserGroup, viewGroup);

admin.get('/group/:userGroupId/name', fetchUserGroup, provideGroupName);
admin.post('/group/:userGroupId/name', fetchUserGroup, upload.none(), provideGroupName);

admin.get('/group/:userGroupId/organisation', fetchUserGroup, provideOrganisation);
admin.post('/group/:userGroupId/organisation', fetchUserGroup, upload.none(), provideOrganisation);

admin.get('/group/:userGroupId/email', fetchUserGroup, provideGroupEmail);
admin.post('/group/:userGroupId/email', fetchUserGroup, upload.none(), provideGroupEmail);

admin.get('/group/:userGroupId/status', fetchUserGroup, groupStatus);
admin.post('/group/:userGroupId/status', fetchUserGroup, upload.none(), groupStatus);

admin.use('/user', (req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'users';
  next();
});

admin.get('/user', listUsers);

admin.get('/user/create', createUser);
admin.post('/user/create', upload.none(), createUser);

admin.get('/user/:userId', fetchUser, viewUser);
admin.post('/user/:userId', fetchUser, upload.none(), viewUser);

admin.get('/user/:userId/roles', fetchUser, editUserRoles);
admin.post('/user/:userId/roles', fetchUser, upload.none(), editUserRoles);

admin.get('/user/:userId/status', fetchUser, userStatus);
admin.post('/user/:userId/status', fetchUser, upload.none(), userStatus);
