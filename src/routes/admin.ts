import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { listUserGroups, provideGroupName, provideOrganisation, provideEmail } from '../controllers/admin';

export const admin = Router();

const upload = multer({ storage: multer.memoryStorage() });

admin.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.activePage = 'admin';
  next();
});

admin.get('/group', listUserGroups);

admin.get('/group/create', provideGroupName);
admin.post('/group/create', upload.none(), provideGroupName);
admin.get('/group/:groupId/name', provideGroupName);
admin.post('/group/:groupId/name', upload.none(), provideGroupName);

admin.get('/group/:groupId/organisation', provideOrganisation);
admin.post('/group/:groupId/organisation', upload.none(), provideOrganisation);

admin.get('/group/:groupId/email', provideEmail);
admin.post('/group/:groupId/email', upload.none(), provideEmail);
