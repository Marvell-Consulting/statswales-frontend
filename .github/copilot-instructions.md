# StatsWales Frontend — Copilot Instructions

## Architecture

Bilingual (en/cy) Welsh Government statistics platform running **two separate Express servers** from one TypeScript codebase:

- **Consumer** (`src/consumer/`) — public-facing: browse topics, search/view/filter/download published datasets
- **Publisher** (`src/publisher/`) — authenticated CMS for data publishers: create/upload/configure/publish datasets

Shared code lives in `src/shared/` (config, middleware, routes, DTOs, enums, i18n, views, utils).

**Views are server-side rendered** using `express-react-views` (`.jsx` files) with React 16 — no client-side hydration.

## Build and Test

```bash
npm run dev          # build + start both servers with nodemon
npm run build        # tsc + sass + copy-assets
npm run test         # jest
npm run test:ci      # jest --ci --coverage
npm run test:e2e     # playwright tests-e2e
npm run lint:fix     # eslint --fix
npm run css          # sass compilation only
```

## Code Style

- Files: `kebab-case.ts` / `kebab-case.tsx` (views)
- Shared middleware/utils/routes go in `src/shared/`; app-specific code stays under `src/consumer/` or `src/publisher/`
- Route files export a named `Router` constant (matching the filename, e.g. `export const consumer = Router()`)
- Controllers are named async function exports (not classes)
- Middleware follows the `(req, res, next) => void` pattern; attaches data to `res.locals` or `req`

## Key Patterns

**Two-app middleware stack** (`src/consumer/app.ts`, `src/publisher/app.ts`):
1. Static assets / transport security
2. `cookieParser` → `featureFlags` → `cookieBanner`
3. i18n → `languageSwitcher`
4. `initServices` (attaches typed API service instances to `req`)
5. `session` → `history`
6. Route registration under `/:lang/...`
7. `notFound` → `errorHandler`

**`initServices` pattern:** both apps instantiate their API client and attach it to `req` in `src/[app]/middleware/services.ts`. Never import API classes directly in controllers.
- Consumer: `req.conapi = new ConsumerApi(req.language as Locale)` (`src/consumer/services/consumer-api.ts`)
- Publisher: `req.pubapi = new PublisherApi(req.language as Locale, req.cookies.jwt)` (`src/publisher/services/publisher-api.ts`)

Both also set shared `res.locals` values (`appEnv`, `buildUrl`, `protocol`, `hostname`, `url`, etc.) used by all views.

**Session:** configured in `src/shared/middleware/session.ts`; Redis store (prefix `sw3f:`) or in-memory. Flash messages stored in `req.session.flash` / `req.session.errors`, cleared into `res.locals` by `flashMessages`/`flashErrors` middleware.

**History:** last 10 URLs tracked in `req.session.history` by `src/shared/middleware/history.ts`.

**Publisher route middleware order** (`src/publisher/routes/publish.ts`):
```ts
publish.use(noCache, flashMessages, flashErrors);
// per-route: fetchDataset(Include.Xxx), redirectIfOpenPublishRequest
```

**i18n:** `i18next` + path-based detection (`/:lang` param = `en-GB` or `cy-GB`). Translation files: `src/shared/i18n/en.json`, `src/shared/i18n/cy.json`. Test assertions use `i18next.t('key', { lng: Locale.English })` rather than hardcoded strings.

**Feature flags** (`src/shared/utils/feature-flags.ts`, `src/shared/middleware/feature-flags.ts`):
- Only active in `staging` and `production` (`AppEnv.Staging`, `AppEnv.Prod`); always returns `true` elsewhere
- Enabled via `?feature=flag1,flag2`; persisted in `featureFlags` cookie (24 h) so subsequent requests don't need the query param
- Only values present in the `FeatureFlag` enum are stored in the cookie — unknown strings are discarded by `validFlags()`
- Use `isFeatureEnabled(req.query, FeatureFlag.Xyz, req.cookies.features)` in server code; pass `featureFlags` from `useLocals()` in React views

## Testing

**Unit/integration tests** (`tests/`):
- Integration tests import the real Express app (`src/publisher/app`) and drive it with `supertest` — no Express mocking
- Backend HTTP calls are intercepted by an **MSW** mock server (`tests/mocks/backend.ts`) using `setupServer`; lifecycle hooks in `beforeAll`/`afterEach`/`afterAll`
- `PublisherApi` unit tests spy on `global.fetch` directly with `jest.spyOn`
- Shared fixtures: `tests/mocks/fixtures.ts`
- Env vars seeded in `tests/.jest/set-env-vars.ts`

**E2E tests** (`tests-e2e/`) run separately with Playwright (`npm run test:e2e`).

## Integration Points

- **StatsWales Backend** — all data via typed API service classes (`PublisherApi`, consumer API); base URL from `config`
- **Valkey / Redis** — session store
- **Azure EntraID** — publisher authentication (JWT cookie `jwt`)
- **Consumer routes** optionally protected by HTTP basic auth (configured via env)
