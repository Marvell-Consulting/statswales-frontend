import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Dashboard from '../../src/publisher/views/admin/dashboard.jsx';
import { DashboardStats } from '../../src/shared/interfaces/dashboard-stats';

const stats: DashboardStats = {
  datasets: {
    summary: {
      incomplete: 1,
      pending_approval: 0,
      scheduled: 0,
      published: 2,
      action_requested: 0,
      archived: 0,
      offline: 0,
      total: 3
    },
    largest: [],
    longest: [],
    without_date_dimension: 7
  },
  users: { summary: { active: 1, published: 1, total: 1 }, most_published: [] },
  groups: { most_published: [] }
};

const baseProps = {
  t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
  buildUrl: (path: string, lang: string) => `/${lang}${path}`,
  url: '/en-GB/admin/dashboard',
  i18n: { language: 'en-GB' },
  isAuthenticated: true,
  activePage: 'dashboard',
  isAdmin: true,
  isDeveloper: false,
  appEnv: 'local',
  hostname: 'localhost',
  cspNonce: 'test-nonce',
  title: 'Service statistics',
  stats
};

describe('Dashboard — datasets without a date dimension', () => {
  const html = renderToStaticMarkup(<Dashboard {...baseProps} />);

  it('shows the number of datasets without a date dimension', () => {
    expect(html).toContain('admin.dashboard.stats.datasets.without_date_dimension.heading');
    expect(html).toContain('admin.dashboard.stats.datasets.without_date_dimension.count:7');
  });

  it('links to the CSV download of those datasets', () => {
    expect(html).toContain('href="/en-GB/admin/datasets/without-date-dimension"');
    expect(html).toContain('admin.dashboard.stats.datasets.without_date_dimension.download');
  });

  it('hides the section when the backend does not supply the count', () => {
    const { without_date_dimension: _omitted, ...datasets } = stats.datasets!;
    const partialStats = { ...stats, datasets } as DashboardStats;
    const partialHtml = renderToStaticMarkup(<Dashboard {...baseProps} stats={partialStats} />);
    expect(partialHtml).not.toContain('admin.dashboard.stats.datasets.without_date_dimension');
  });
});
