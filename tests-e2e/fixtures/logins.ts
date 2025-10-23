import path from 'node:path';

export const users = {
  publisher: {
    id: 'f3dc1ae6-273e-4ac9-a498-ba2813c51c24',
    username: 'test_publisher_1',
    path: path.join(__dirname, '../../playwright/.auth/publisher.json')
  },
  admin: {
    id: '044d94c5-91ba-495e-a718-31c597a0a30b',
    username: 'test_admin_1',
    path: path.join(__dirname, '../../playwright/.auth/admin.json')
  },
  approver: {
    id: 'ce08727e-dd3f-48cc-921a-cae5c4dd4a18',
    username: 'test_approver_1',
    path: path.join(__dirname, '../../playwright/.auth/approver.json')
  },
  solo: {
    id: '80d989fb-c26f-40dc-9a0b-6dc2083c0f0c',
    username: 'test_solo_1',
    path: path.join(__dirname, '../../playwright/.auth/solo.json')
  }
};
