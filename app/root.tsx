import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { getLocale, i18nextMiddleware, localeCookie } from '~/middleware/i18next.server';
import { useChangeLanguage } from 'remix-i18next/react';
import { useTranslation } from 'react-i18next';
import { PhaseBanner } from './components/phase-banner';
import { Header } from './components/header';
import { sessionMiddleware } from './middleware/session';
import { languageSwitcher } from './middleware/language-switcher';
import { authMiddleware } from './middleware/auth-middleware';

export const unstable_middleware = [
  authMiddleware,
  sessionMiddleware,
  i18nextMiddleware,
  languageSwitcher
];

// export const links: Route.LinksFunction = () => [
//   { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
//   {
//     rel: 'preconnect',
//     href: 'https://fonts.gstatic.com',
//     crossOrigin: 'anonymous'
//   },
//   {
//     rel: 'stylesheet',
//     href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
//   }
// ];

export async function loader({ context }: Route.LoaderArgs) {
  let locale = getLocale(context);
  return data({ locale }, { headers: { 'Set-Cookie': await localeCookie.serialize(locale) } });
}

export function Layout({ children }: { children: React.ReactNode }) {
  let { i18n } = useTranslation();

  return (
    <html lang={i18n.language} dir={i18n.dir(i18n.language)} className="govuk-template wg">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0c0c" />
        <link rel="icon" sizes="48x48" href="/assets/images/favicon.ico" />
        <link rel="mask-icon" href="/assets/images/govuk-icon-mask.svg" color="#0b0c0c" />
        <link rel="apple-touch-icon" href="/assets/images/govuk-icon-180.png" />
        <link rel="manifest" href="/assets/manifest.json" />
        {/* <title>StatsWales {t('beta')}</title> */}
        <Meta />
        <Links />
      </head>
      <body
        className={'govuk-template__body app-body-className'}
        data-test="My value"
        data-other="report:details"
        // this is needed to supress govuk frontend warnings
        suppressHydrationWarning
      >
        <a id="top"></a>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.body.classList.add('js-enabled');
              if ('noModule' in HTMLScriptElement.prototype) {
                  document.body.classList.add('govuk-frontend-supported');
              }`
          }}
        />
        <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
          Skip to main content
        </a>

        <PhaseBanner />
        <Header />

        {children}
        <ScrollRestoration />
        <Scripts />

        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import { initAll } from '/assets/js/govuk-frontend.min.js'
              initAll();
              `
          }}
        />

        <script type="module" src="/assets/js/govuk-frontend.min.js" />

        <script src="https://kit.fontawesome.com/f6f4af2d4c.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  useChangeLanguage(loaderData.locale);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      asdasdad
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
