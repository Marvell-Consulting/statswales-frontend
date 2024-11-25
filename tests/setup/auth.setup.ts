import { test as setup } from '@playwright/test';
import JWT from 'jsonwebtoken';

import { appConfig } from '../../src/config';
import { User } from '../../src/interfaces/user.interface';
import { adminContext, publisherContext, approverContext } from '../../playwright/.auth/contexts';

const config = appConfig();
const jwtSecret = config.auth.jwt.secret;

export const adminUser: User = {
  id: '044d94c5-91ba-495e-a718-31c597a0a30b',
  name: 'Tom Admin',
  email: 'tom.admin@example.com'
};

export const publisherUser: User = {
  id: 'f3dc1ae6-273e-4ac9-a498-ba2813c51c24',
  name: 'Joe Publisher',
  email: 'joe.publisher@example.com'
};

export const approverUser: User = {
  id: 'ce08727e-dd3f-48cc-921a-cae5c4dd4a18',
  name: 'Frank Approver',
  email: 'frank.approver@example.com'
};

const jwtCookie = (user: User) => {
  return {
    name: 'jwt',
    value: JWT.sign({ user }, jwtSecret),
    domain: 'localhost',
    path: '/'
  };
};

setup('authenticate as admin', async ({ page }) => {
  await page.context().addCookies([jwtCookie(adminUser)]);
  await page.context().storageState({ path: adminContext });
});

setup('authenticate as publisher', async ({ page }) => {
  await page.context().addCookies([jwtCookie(publisherUser)]);
  await page.context().storageState({ path: publisherContext });
});

setup('authenticate as approver', async ({ page }) => {
  await page.context().addCookies([jwtCookie(approverUser)]);
  await page.context().storageState({ path: approverContext });
});
