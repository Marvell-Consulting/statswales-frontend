import path from 'node:path';

export type TestRole = 'publisher' | 'approver' | 'solo' | 'admin' | 'dev';

export interface TestUser {
  id: string;
  username: string;
  path: string;
}

export interface WorkerUsers {
  publisher: TestUser;
  approver: TestUser;
  solo: TestUser;
  admin?: TestUser;
  dev?: TestUser;
}

const authDir = path.join(__dirname, '../../playwright/.auth');

function user(id: string, username: string, filename: string): TestUser {
  return { id, username, path: path.join(authDir, filename) };
}

// ── Admin pool ──────────────────────────────────────────────────────────

export const admins: TestUser[] = [
  user('044d94c5-91ba-495e-a718-31c597a0a30b', 'test_admin_1', 'admin_1.json'),
  user('e0cbb352-f7ec-4d78-ac66-d8f84750065e', 'test_admin_2', 'admin_2.json'),
  user('11b7aa4d-e5e6-4de8-8403-c2cd42401884', 'test_admin_3', 'admin_3.json')
];

// ── Dev pool ────────────────────────────────────────────────────────────

export const devs: TestUser[] = [
  user('2966170e-d88c-46fc-a8a8-f57826dec7e8', 'test_dev_1', 'dev_1.json'),
  user('ab10c4e6-ff19-40f5-b9c1-5a60bed93056', 'test_dev_2', 'dev_2.json'),
  user('be1cd621-00e9-42af-b205-ea2be46dc98e', 'test_dev_3', 'dev_3.json')
];

// ── Publisher pool ──────────────────────────────────────────────────────

export const publishers: TestUser[] = [
  user('f3dc1ae6-273e-4ac9-a498-ba2813c51c24', 'test_publisher_1', 'publisher_1.json'),
  user('d0d57b29-2cf7-4780-9440-9107c19f926d', 'test_publisher_2', 'publisher_2.json'),
  user('3556e694-ee64-443a-a1e5-9b92f1a40916', 'test_publisher_3', 'publisher_3.json'),
  user('1e8524a3-855f-4fe9-be5f-6f35534285be', 'test_publisher_4', 'publisher_4.json'),
  user('7ea50243-765e-479e-9a75-1582c7cbe6b8', 'test_publisher_5', 'publisher_5.json'),
  user('abfab535-b67e-4e9b-aaca-95d2b970949f', 'test_publisher_6', 'publisher_6.json'),
  user('6f1814c7-d37c-49e7-b9a7-f57ee7bee2b4', 'test_publisher_7', 'publisher_7.json'),
  user('69190ec3-3247-4e7e-a25c-a59534ca44c7', 'test_publisher_8', 'publisher_8.json'),
  user('2813f2af-0abd-4217-a607-b71304d0401b', 'test_publisher_9', 'publisher_9.json'),
  user('6c5dfa24-39b3-4a03-adef-8d3a468b5f94', 'test_publisher_10', 'publisher_10.json')
];

// ── Approver pool ───────────────────────────────────────────────────────

export const approvers: TestUser[] = [
  user('ce08727e-dd3f-48cc-921a-cae5c4dd4a18', 'test_approver_1', 'approver_1.json'),
  user('e4537822-6339-4236-bdb3-545518953bac', 'test_approver_2', 'approver_2.json'),
  user('5f65baa8-4cdc-4833-a0ce-e38a3fdfb024', 'test_approver_3', 'approver_3.json'),
  user('aa381510-0cbc-43f5-8938-516f5cb42b17', 'test_approver_4', 'approver_4.json'),
  user('ec3d62f4-f57a-452e-b372-8389a27c4893', 'test_approver_5', 'approver_5.json'),
  user('fe890ad0-646a-4cf8-8af7-2ef6da69bbba', 'test_approver_6', 'approver_6.json'),
  user('c5ed90c7-e9b0-4ede-a2ad-ff706c70141c', 'test_approver_7', 'approver_7.json'),
  user('2355d1b4-79ed-4ddb-ba84-3acbafc4c8df', 'test_approver_8', 'approver_8.json'),
  user('6e7fadb9-a6be-474a-9920-247c20e21905', 'test_approver_9', 'approver_9.json'),
  user('a8c19647-f110-46da-9c10-dfeb44e85f77', 'test_approver_10', 'approver_10.json')
];

// ── Solo pool (editor + approver) ───────────────────────────────────────

export const solos: TestUser[] = [
  user('80d989fb-c26f-40dc-9a0b-6dc2083c0f0c', 'test_solo_1', 'solo_1.json'),
  user('e855e8c8-36f5-4f0d-bc24-85bc69f248fc', 'test_solo_2', 'solo_2.json'),
  user('c3b6b867-3246-47d7-ae0a-5dd35145be27', 'test_solo_3', 'solo_3.json'),
  user('5f3c4fdd-8359-4988-9719-e61bf1001ef3', 'test_solo_4', 'solo_4.json'),
  user('0523eb36-1752-4de3-af99-13a4557c07cd', 'test_solo_5', 'solo_5.json'),
  user('fd47af00-70db-431f-b5fe-2d1f6324240e', 'test_solo_6', 'solo_6.json'),
  user('5559f222-eb7a-458d-9b42-97c1644a8a99', 'test_solo_7', 'solo_7.json'),
  user('82ffc725-d6fd-4887-a1bd-60be2eb8a9d9', 'test_solo_8', 'solo_8.json'),
  user('b9d37d98-0cc8-451a-81a7-68d7de1738bc', 'test_solo_9', 'solo_9.json'),
  user('e4d6b401-3523-4563-9298-1035c2e3bfab', 'test_solo_10', 'solo_10.json')
];

// ── All pools (keyed by role, for dynamic acquisition) ──────────────────

export const pools: Record<TestRole, TestUser[]> = {
  admin: admins,
  dev: devs,
  publisher: publishers,
  approver: approvers,
  solo: solos
};

// ── Flat list of every user (for auth setup to iterate) ─────────────────

export const allUsers: TestUser[] = [...admins, ...devs, ...publishers, ...approvers, ...solos];
