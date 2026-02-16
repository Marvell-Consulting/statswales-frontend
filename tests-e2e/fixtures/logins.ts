import path from 'node:path';

export type TestRole = 'publisher' | 'approver' | 'solo';

export interface TestUser {
  id: string;
  username: string;
  path: string;
}

export interface WorkerUsers {
  publisher: TestUser;
  approver: TestUser;
  solo: TestUser;
  admin: TestUser;
}

const authDir = path.join(__dirname, '../../playwright/.auth');

function user(id: string, username: string, filename: string): TestUser {
  return { id, username, path: path.join(authDir, filename) };
}

// ── Admin (shared across all workers — read-only role) ──────────────────

export const admin = user('044d94c5-91ba-495e-a718-31c597a0a30b', 'test_admin_1', 'admin.json');

// ── Publisher pool (one per worker) ─────────────────────────────────────

export const publishers: TestUser[] = [
  user('f3dc1ae6-273e-4ac9-a498-ba2813c51c24', 'test_publisher_1', 'publisher_1.json'),
  user('d0d57b29-2cf7-4780-9440-9107c19f926d', 'test_publisher_2', 'publisher_2.json'),
  user('3556e694-ee64-443a-a1e5-9b92f1a40916', 'test_publisher_3', 'publisher_3.json'),
  user('1e8524a3-855f-4fe9-be5f-6f35534285be', 'test_publisher_4', 'publisher_4.json')
];

// ── Approver pool (one per worker) ──────────────────────────────────────

export const approvers: TestUser[] = [
  user('ce08727e-dd3f-48cc-921a-cae5c4dd4a18', 'test_approver_1', 'approver_1.json'),
  user('e4537822-6339-4236-bdb3-545518953bac', 'test_approver_2', 'approver_2.json'),
  user('5f65baa8-4cdc-4833-a0ce-e38a3fdfb024', 'test_approver_3', 'approver_3.json'),
  user('aa381510-0cbc-43f5-8938-516f5cb42b17', 'test_approver_4', 'approver_4.json')
];

// ── Solo pool (editor + approver, one per worker) ───────────────────────

export const solos: TestUser[] = [
  user('80d989fb-c26f-40dc-9a0b-6dc2083c0f0c', 'test_solo_1', 'solo_1.json'),
  user('e855e8c8-36f5-4f0d-bc24-85bc69f248fc', 'test_solo_2', 'solo_2.json'),
  user('c3b6b867-3246-47d7-ae0a-5dd35145be27', 'test_solo_3', 'solo_3.json'),
  user('5f3c4fdd-8359-4988-9719-e61bf1001ef3', 'test_solo_4', 'solo_4.json')
];

// ── Flat list of every user (for auth setup to iterate) ─────────────────

export const allUsers: TestUser[] = [admin, ...publishers, ...approvers, ...solos];

// ── Per-worker user assignment ──────────────────────────────────────────

const POOL_SIZE = publishers.length;

export function getUsersForWorker(workerIndex: number): WorkerUsers {
  const idx = workerIndex % POOL_SIZE;
  return {
    publisher: publishers[idx],
    approver: approvers[idx],
    solo: solos[idx],
    admin
  };
}
