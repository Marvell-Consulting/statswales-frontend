import { test as setup } from '@playwright/test';
import JWT from 'jsonwebtoken';

import { appConfig } from '../../src/config';
import { User } from '../../src/interfaces/user.interface';
import { adminContext, publisherContext, approverContext } from '../../playwright/.auth/contexts';
import { admin1, publisher1, approver1 } from '../fixtures/users';

const config = appConfig();
const jwtSecret = config.auth.jwt.secret;

const jwtCookie = (user: User) => {
  return {
    name: 'jwt',
    value: JWT.sign({ user }, jwtSecret),
    domain: 'localhost',
    path: '/'
  };
};

setup('authenticate as admin', async ({ page }) => {
  await page.context().addCookies([jwtCookie(admin1)]);
  await page.context().storageState({ path: adminContext });
});

setup('authenticate as publisher', async ({ page }) => {
  await page.context().addCookies([jwtCookie(publisher1)]);
  await page.context().storageState({ path: publisherContext });
});

setup('authenticate as approver', async ({ page }) => {
  await page.context().addCookies([jwtCookie(approver1)]);
  await page.context().storageState({ path: approverContext });
});
