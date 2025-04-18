import path from 'path';

export const users = {
  publisher: {
    username: 'test_publisher_1',
    path: path.join(__dirname, '../../playwright/.auth/publisher.json')
  },
  admin: {
    username: 'test_admin_1',
    path: path.join(__dirname, '../../playwright/.auth/admin.json')
  },
  approver: {
    username: 'test_approver_1',
    path: path.join(__dirname, '../../playwright/.auth/approver.json')
  }
};
