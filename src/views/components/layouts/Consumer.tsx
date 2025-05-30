import React, { PropsWithChildren } from 'react';
import { Locals, LocalsProvider, useLocals } from '../../context/Locals';

const Layout = ({ children }: PropsWithChildren) => {
  const { i18n, t, buildUrl } = useLocals();
  const links = [
    'contact_us',
    'accessibility',
    'copyright_statement',
    'cookies',
    'privacy',
    'terms_conditions',
    'modern_slavery'
  ];
  return (
    <html lang={i18n.language} className="govuk-template wg">
      <head>
        <meta charSet="utf-8" />
        <title>StatsWales {t('beta')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0c0c" />
        <link rel="icon" sizes="48x48" href="/assets/images/favicon.ico" />
        <link rel="icon" sizes="any" href="/assets/images/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/assets/images/govuk-icon-mask.svg" color="#0b0c0c" />
        <link rel="apple-touch-icon" href="/assets/images/govuk-icon-180.png" />
        <link rel="manifest" href="/assets/manifest.json" />
        <link rel="stylesheet" href="/css/govuk-frontend.min.css" />
        <link rel="stylesheet" href="/css/app.css" />
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
          Skip to main content
        </a>

        <div className="govuk-phase-banner">
          <div className="govuk-width-container">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">
                {t('consumer.global.phase_banner.beta')}
              </strong>
              <span
                className="govuk-phase-banner__text"
                dangerouslySetInnerHTML={{
                  __html: t('consumer.global.phase_banner.feedback', {
                    feedback_url: `/${i18n.language}/${t('routes.feedback')}`
                  })
                }}
              ></span>
            </p>
          </div>
        </div>

        <header id="wg-header" className="wg-header" style={{ backgroundColor: '#323232' }}>
          <div className="layout-container">
            <div className="header" id="header">
              <div className="header__components container-fluid">
                <div id="block-govwales-branding">
                  <a
                    href={buildUrl('/published', i18n.language)}
                    title="Welsh Government"
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
            <a href={buildUrl('/published', i18n.language)}>
              <div className="statsWales-logo" role="img" aria-label="StatsWales logo"></div>
            </a>
          </div>
        </nav>

        <hr className="govuk-section-break govuk-section-break--l govuk-!-margin-bottom-0 govuk-section-break--visible" />

        <main className="govuk-main-wrapper govuk-!-padding-top-0" id="main-content" role="main">
          <div className="govuk-width-container">{children}</div>
        </main>

        <footer className="wg-footer">
          <div className="govuk-width-container govuk-!-padding-top-9">
            <ul className="footer-menu govuk-list">
              {links.map((link) => (
                <li className="govuk-footer__inline-list-item">
                  <a className="govuk-footer__link" href="#">
                    {t(`footer.${link}`)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="wg-footer-logo"></div>
            <div>
              <br />
              <br />
            </div>
          </div>
        </footer>

        <script type="module" src="/assets/js/govuk-frontend.min.js" />
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
            import { initAll } from '/assets/js/govuk-frontend.min.js';
            initAll();`
          }}
        />
        <script src="https://kit.fontawesome.com/f6f4af2d4c.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
};

export default function ConsumerLayout({ children, ...props }: PropsWithChildren<Locals>) {
  return (
    <LocalsProvider {...props}>
      <Layout>{children}</Layout>
    </LocalsProvider>
  );
}
