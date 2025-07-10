import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import T from '../T';
import { Locals, LocalsProvider, useLocals } from '../../context/Locals';

export type LayoutProps = {
  title?: string;
  formPage?: boolean;
  returnLink?: string;
  backLink?: string;
};

const Layout = ({ title, children, backLink, returnLink, formPage }: PropsWithChildren<LayoutProps>) => {
  const { i18n, t, supportEmail, isAuthenticated, buildUrl, activePage, isAdmin, isDeveloper } = useLocals();
  return (
    <html lang={i18n.language} className="govuk-template wg">
      <head>
        <meta charSet="utf-8" />
        <title>
          {t('app_title')} {t('beta')}
          {title ? ` - ${title}` : ''}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/ico" href="/assets/images/favicon.ico" />
        <link rel="shortcut icon" href="/assets/images/favicon.ico" type="image/x-icon" />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="180x180"
          href="/assets/images/apple-touch-icon-180x180-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="152x152"
          href="/assets/images/apple-touch-icon-152x152-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="144x144"
          href="/assets/images/apple-touch-icon-144x144-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="120x120"
          href="/assets/images/apple-touch-icon-120x120-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="114x114"
          href="/assets/images/apple-touch-icon-114x114-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="76x76"
          href="/assets/images/apple-touch-icon-76x76-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="72x72"
          href="/assets/images/apple-touch-icon-72x72-precomposed.png"
        />
        <link rel="apple-touch-icon-precomposed" href="/assets/images/apple-touch-icon-precomposed.png" />
        <link rel="icon" sizes="192x192" href="/assets/images/touch-icon-192.png" />
        <link rel="icon" sizes="32x32" href="/assets/images/favicon-32.png" />
        <link rel="icon" sizes="48x48" href="/assets/images/favicon-48.png" />
        <meta name="msapplication-TileColor" content="#b60404" />
        <meta name="msapplication-TileImage" content="/assets/images/ms-icon-144x144.png" />
        <link rel="manifest" href="/assets/manifest.json" />
        <link rel="stylesheet" href="/css/govuk-frontend.min.css" />
        <link rel="stylesheet" href="/css/accessible-autocomplete.min.css" />
        <link rel="stylesheet" href="/css/app.css" />
        {isDeveloper && (
          <>
            <link rel="stylesheet" href="/css/highlight.css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/fira_code.min.css" />
          </>
        )}

        <meta property="og:image" content="/images/govuk-opengraph-image.png" />
        <meta name="theme-color" content="#323232" />
        <meta name="theme-color" content="#323232" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#323232" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-navbutton-color" content="#323232" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#323232" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        />
      </head>

      <body className="govuk-template__body app-body-className" data-test="My value" data-other="report:details">
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
          {t('header.navigation.skip_to_content')}
        </a>

        <div className="govuk-phase-banner">
          <div className="govuk-width-container">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">
                {t('consumer.global.phase_banner.beta')}
              </strong>
              <T className="govuk-phase-banner__text" raw>
                header.feedback
              </T>
            </p>
          </div>
        </div>

        <header id="wg-header" className="wg-header">
          <div className="layout-container">
            <div className="header" id="header">
              <div className="header__components container-fluid">
                <div id="block-govwales-branding">
                  <a
                    href={buildUrl('/', i18n.language)}
                    title={t('header.navigation.home')}
                    className="header__logo"
                    id="logo"
                  >
                    <span className="visually-hidden">{t('consumer.global.home_label')}</span>
                  </a>
                </div>
                <div
                  className="language-switcher-language-url"
                  id="block-govwales-languageswitcher"
                  role="navigation"
                  aria-label="Language"
                >
                  <ul className="links">
                    {i18n.language === 'en-GB' ? (
                      <li className="cy">
                        <a className="language-link" lang="cy" hrefLang="cy" href="?lang=cy-GB" role="button">
                          Cymraeg
                        </a>
                      </li>
                    ) : (
                      <li className="en">
                        <a className="language-link" lang="en" hrefLang="en" href="?lang=en-GB" role="button">
                          English
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="primary js-primary-nav" aria-label="Primary Navigation">
          <div className="govuk-width-container nav__toggle">
            <a href={buildUrl('/', i18n.language)}>
              <div className="statsWales-logo" role="img" aria-label={t('header.logo')}></div>
            </a>
            {isAuthenticated && (
              <a
                className="button button--secondary ignore-external helper-menu__sign-out"
                href={`/${i18n.language}/auth/logout`}
              >
                {t('header.navigation.logout')}
              </a>
            )}
          </div>
          <div className="nav__content">
            <div className="govuk-width-container">
              <ul aria-hidden="true">
                <li>
                  <a
                    href={buildUrl('/', i18n.language)}
                    className={clsx({ 'is-active': activePage === 'home' })}
                    aria-current={activePage === 'home' ? 'page' : undefined}
                  >
                    {t('header.navigation.home')}
                  </a>
                </li>
                {isAdmin && (
                  <>
                    <li>
                      <a
                        href={buildUrl('/admin/group', i18n.language)}
                        className={clsx({ 'is-active': activePage === 'groups' })}
                        aria-current={activePage === 'groups' ? 'page' : undefined}
                      >
                        {t('header.navigation.groups')}
                      </a>
                    </li>
                    <li>
                      <a
                        href={buildUrl('/admin/user', i18n.language)}
                        className={clsx({ 'is-active': activePage === 'users' })}
                        aria-current={activePage === 'users' ? 'page' : undefined}
                      >
                        {t('header.navigation.users')}
                      </a>
                    </li>
                  </>
                )}
                <li>
                  <a
                    href={buildUrl('/guidance', i18n.language)}
                    className={clsx({ 'is-active': activePage === 'guidance' })}
                    aria-current={activePage === 'guidance' ? 'page' : undefined}
                  >
                    {t('header.navigation.guidance')}
                  </a>
                </li>
                {isDeveloper && (
                  <li>
                    <a
                      href={buildUrl('/developer', i18n.language)}
                      className={clsx({ 'is-active': activePage === 'developer' })}
                      aria-current={activePage === 'developer' ? 'page' : undefined}
                    >
                      {t('header.navigation.developer')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {backLink && (
          <div className="top-links">
            <div className="govuk-width-container">
              <a href={backLink} className="govuk-back-link">
                {t('buttons.back')}
              </a>
            </div>
          </div>
        )}

        <main className={clsx('govuk-main-wrapper', { 'form-background': formPage })} id="main-content" role="main">
          <div className="govuk-width-container">
            {children}
            {returnLink && (
              <a href={returnLink} className="govuk-link return-link">
                {t('publish.header.overview')}
              </a>
            )}
          </div>
        </main>

        <footer className="wg-footer">
          <div className="footer-top">
            <div className="govuk-width-container">
              <a href="#top" role="button" className="govuk-button govuk-button--secondary govuk-button--top">
                {t('footer.top_of_page')}
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
                <a href="https://www.gov.wales/accessibility-statement-govwales">{t('footer.accessibility')}</a>
              </li>
              <li className="menu__item">
                <a href="https://www.gov.wales/copyright-statement">{t('footer.copyright_statement')}</a>
              </li>
              <li className="menu__item">
                <a href={`/${i18n.language}/cookies`}>{t('footer.cookies')}</a>
              </li>
              <li className="menu__item">
                <a href="https://www.gov.wales/website-privacy-policy">{t('footer.privacy')}</a>
              </li>
              <li className="menu__item">
                <a href="https://www.gov.wales/terms-and-conditions">{t('footer.terms_conditions')}</a>
              </li>
              <li className="menu__item">
                <a href="https://www.gov.wales/welsh-government-modern-slavery-statement">
                  {t('footer.modern_slavery')}
                </a>
              </li>
              <li className="menu__item">
                <a href="https://www.gov.wales/alternative-languages">Alternative languages</a>
              </li>
            </ul>
            <div className="wg-footer-logo"></div>
          </div>
        </footer>

        <script type="module" src="/assets/js/govuk-frontend.min.js"></script>
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import { initAll } from '/assets/js/govuk-frontend.min.js';
              initAll();

              const toShow = document.querySelectorAll(".non-js-hidden");
              toShow.forEach(el => el.classList.remove("non-js-hidden"))
              `
          }}
        />
        <script src="https://kit.fontawesome.com/f6f4af2d4c.js" crossOrigin="anonymous"></script>
      </body>
    </html>
  );
};

export default function PublisherLayout(props: PropsWithChildren<Locals & LayoutProps>) {
  return (
    <LocalsProvider {...props}>
      <Layout {...props}>{props.children}</Layout>
    </LocalsProvider>
  );
}
