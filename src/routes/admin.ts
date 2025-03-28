import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

import {
  listUserGroups,
  provideGroupName,
  provideOrganisation,
  provideEmail,
  fetchUserGroup,
  viewGroup
} from '../controllers/admin';

export const admin = Router();

const upload = multer({ storage: multer.memoryStorage() });

admin.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'admin';
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

admin.get('/group/:userGroupId/email', fetchUserGroup, provideEmail);
admin.post('/group/:userGroupId/email', fetchUserGroup, upload.none(), provideEmail);
