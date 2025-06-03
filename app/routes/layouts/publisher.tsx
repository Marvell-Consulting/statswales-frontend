import clsx from 'clsx';
import T from '../../components/T';
import { LocaleLink } from '~/components/LocaleLink';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Outlet } from 'react-router';
import { PublisherNav } from '~/components/publisher-nav';
import type { Route } from './+types/publisher';
import { authContext } from '~/middleware/auth-middleware';

export type LayoutProps = {
  title?: string;
  formPage?: boolean;
  returnLink?: string;
  backLink?: string;
};

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/ico', href: '/assets/images/favicon.ico' },
  { rel: 'shortcut icon', href: '/assets/images/favicon.ico', type: 'image/x-icon' },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '180x180',
    href: '/assets/images/apple-touch-icon-180x180-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '152x152',
    href: '/assets/images/apple-touch-icon-152x152-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '144x144',
    href: '/assets/images/apple-touch-icon-144x144-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '120x120',
    href: '/assets/images/apple-touch-icon-120x120-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '114x114',
    href: '/assets/images/apple-touch-icon-114x114-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '76x76',
    href: '/assets/images/apple-touch-icon-76x76-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    sizes: '72x72',
    href: '/assets/images/apple-touch-icon-72x72-precomposed.png'
  },
  {
    rel: 'apple-touch-icon-precomposed',
    href: '/assets/images/apple-touch-icon-precomposed.png'
  },
  { rel: 'icon', sizes: '192x192', href: '/assets/images/touch-icon-192.png' },
  { rel: 'icon', sizes: '32x32', href: '/assets/images/favicon-32.png' },
  { rel: 'icon', sizes: '48x48', href: '/assets/images/favicon-48.png' },
  { rel: 'manifest', href: '/assets/manifest.json' }
  // FIXME: {isDeveloper && (
  //   <>
  //     <link rel="stylesheet" href="/css/highlight.css" />
  //     <link
  //       rel="stylesheet"
  //       href="https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css"
  //     />
  //   </>
  // )}
];

export const meta: Route.MetaFunction = () => {
  return [
    { name: 'msapplication-TileColor', content: '#b60404' },
    { name: 'msapplication-TileImage', content: '/assets/images/ms-icon-144x144.png' },
    { property: 'og:image', content: '/images/govuk-opengraph-image.png' },
    { name: 'theme-color', content: '#323232' },
    { name: 'theme-color', content: '#323232', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#323232', media: '(prefers-color-scheme: dark)' },
    { name: 'msapplication-navbutton-color', content: '#323232' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: '#323232' }
    // { title: <T>app_title')} <T>beta')} {title ? ` - ${title}` : </T>
  ];
};

export const loader = ({ context }: Route.LoaderArgs) => {
  const auth = context.get(authContext);
  return {
    isAdmin: auth.isAdmin,
    isDeveloper: auth.isDeveloper,
    isAuthenticated: auth.isAuthenticated
  };
};

export default function PublisherLayout({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  // TODO: fixme
  const formPage = false;
  const supportEmail = '';

  return (
    <>
      <PublisherNav
        isAdmin={loaderData.isAdmin}
        isAuthenticated={loaderData.isAuthenticated}
        isDeveloper={loaderData.isDeveloper}
      />
      {/* {backLink && (
          <div className="top-links">
            <div className="govuk-width-container">
              <a href={backLink} className="govuk-back-link">
                <T>buttons.back</T>
              </a>
            </div>
          </div>
        )} */}

      <main
        className={clsx('govuk-main-wrapper', { 'form-background': formPage })}
        id="main-content"
        role="main"
      >
        <div className="govuk-width-container">
          <Outlet />
          {/* {returnLink && (
              <a href={returnLink} className="govuk-link return-link">
                <T>publish.header.overview</T>
              </a>
            )} */}
        </div>
      </main>

      <footer className="wg-footer">
        <div className="footer-top">
          <div className="govuk-width-container">
            <a
              href="#top"
              role="button"
              className="govuk-button govuk-button--secondary govuk-button--top"
            >
              <T>footer.top_of_page</T>
            </a>
          </div>
        </div>
        <div className="govuk-width-container govuk-!-padding-top-9">
          <ul className="footer-menu govuk-list">
            <li className="menu__item">
              <a href={`mailto:${supportEmail}`}>
                <T>footer.contact_us</T>
              </a>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/accessibility-statement-govwales">
                <T>footer.accessibility</T>
              </a>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/copyright-statement">
                <T>footer.copyright_statement</T>
              </a>
            </li>
            <li className="menu__item">
              <LocaleLink path="/cookies">
                <T>footer.cookies</T>
              </LocaleLink>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/website-privacy-policy">
                <T>footer.privacy</T>
              </a>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/terms-and-conditions">
                <T>footer.terms_conditions</T>
              </a>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/welsh-government-modern-slavery-statement">
                <T>footer.modern_slavery</T>
              </a>
            </li>
            <li className="menu__item">
              <a href="https://www.gov.wales/alternative-languages">Alternative languages</a>
            </li>
          </ul>
          <div className="wg-footer-logo"></div>
        </div>
      </footer>
    </>
  );
}

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
};
