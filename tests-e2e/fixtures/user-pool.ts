import fs from 'node:fs';
import path from 'node:path';

import { TestUser } from './logins';

const lockDir = path.join(__dirname, '../../playwright/.locks');

export function acquireUser(pool: TestUser[]): TestUser {
  fs.mkdirSync(lockDir, { recursive: true });

  for (const user of pool) {
    const lockFile = path.join(lockDir, `${user.id}.lock`);
    try {
      fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
      return user;
    } catch {
      // Already claimed — try next user
    }
  }

  throw new Error(`No available users in pool of ${pool.length}`);
}

export function releaseUser(user: TestUser): void {
  const lockFile = path.join(lockDir, `${user.id}.lock`);
  try {
    fs.unlinkSync(lockFile);
  } catch {
    // Already released
  }
}

export function clearAllLocks(): void {
  fs.rmSync(lockDir, { recursive: true, force: true });
}
