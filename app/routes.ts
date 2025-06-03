import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
  ...prefix(':lang', [
    layout('routes/layouts/publisher.tsx', [
      // AUTH ROUTES
      ...prefix('/auth', [
        route('/login', 'routes/auth/login.tsx'),
        route('/logout', 'routes/auth/logout.tsx'),
        route('/entraid', 'routes/auth/entraid.ts'),
        route('/callback', 'routes/auth/callback.ts')
      ]),

      layout('routes/auth/require-auth.tsx', [
        // PUBLISHER ROUTES
        index('routes/homepage.tsx'),
        ...prefix('/publish', [
          index('routes/publish/start.tsx'),
          route('/group', 'routes/publish/group.tsx'),
          route('/title', 'routes/publish/title.tsx'),
          ...prefix('/:datasetId', [
            route('/overview', 'routes/publish/dataset/overview.tsx'),
            route('/tasklist', 'routes/publish/dataset/tasklist.tsx'),
            route('/upload', 'routes/publish/dataset/upload-dataset.tsx'),
            route('/preview', 'routes/publish/dataset/preview.tsx'),
            route('/sources', 'routes/publish/dataset/sources.tsx')
          ])
        ]),
        // ADMIN ROUTES
        route('/admin', 'routes/admin/ensure-admin.tsx', [
          ...prefix('group', [index('routes/admin/groups/list.tsx')]),
          ...prefix('user', [index('routes/admin/users/list.tsx')])
        ])
      ]),

      // UNAUTHENTICATED ROUTES
      ...prefix('/guidance', [
        index('routes/guidance/contents.tsx'),
        route('/:doc', 'routes/guidance/doc.tsx')
      ]),

      route('/cookies', 'routes/cookies.tsx')
    ]),

    // CONSUMER ROUTES
    ...prefix('/published', [
      layout('routes/layouts/consumer.tsx', [
        route('/:datasetId', 'routes/published/consumer-view.tsx')
      ])
    ])
  ]),

  route('/api/locales/:lng/:ns', 'routes/locales.ts'),
  route('*', 'routes/errors/not-found.tsx')
] satisfies RouteConfig;
