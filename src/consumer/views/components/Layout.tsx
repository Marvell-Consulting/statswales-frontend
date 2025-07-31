import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { Locals, LocalsProvider, useLocals } from '../../../shared/views/context/Locals';
import CookieBanner from '../../../shared/views/components/CookieBanner';

const Layout = ({ children, title, noPad }: PropsWithChildren<{ title?: string; noPad?: boolean }>) => {
  const { i18n, t, buildUrl } = useLocals();

  return (
    <html lang={i18n.language} className="govuk-template wg">
      <head>
        <meta charSet="utf-8" />
        <title>
          {title ? `${title} | ` : ''}
          {t('app_title')}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0c0c" />
        <link rel="icon" sizes="48x48" href="/assets/images/favicon.ico" />
        <link rel="icon" sizes="any" href="/assets/images/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/assets/images/govuk-icon-mask.svg" color="#0b0c0c" />
        <link rel="apple-touch-icon" href="/assets/images/govuk-icon-180.png" />
        <link rel="manifest" href="/assets/manifest.json" />
        <link rel="stylesheet" href="/assets/css/govuk-frontend.min.css" />
        <link rel="stylesheet" href="/assets/css/app.css" />
      </head>

      <body className="govuk-template__body app-body-className" data-test="My value" data-other="report:details">
        <span id="top"></span>
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

        <CookieBanner />

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
                    href={t('header.navigation.wgurl')}
                    title={t('header.navigation.wghome')}
                    className="header__logo"
                    id="logo"
                  >
                    <span className="visually-hidden">{t('consumer.navigation.wghome')}</span>
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
            <a
              className="statsWales-logo"
              href={buildUrl('/', i18n.language)}
              role="img"
              title={t('header.navigation.home')}
              aria-label={t('header.logo')}
            />
          </div>
        </nav>

        <hr className="govuk-section-break govuk-section-break--l govuk-!-margin-bottom-0 govuk-section-break--visible" />

        <main className={clsx('govuk-main-wrapper', { 'govuk-!-padding-top-0': noPad })} id="main-content" role="main">
          <div className="govuk-width-container">{children}</div>
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
                <a href={t('footer.contact_us_link')}>{t('footer.contact_us')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.accessibility_link')}>{t('footer.accessibility')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.copyright_statement_link')}>{t('footer.copyright_statement')}</a>
              </li>
              <li className="menu__item">
                <a href={buildUrl(`/cookies`, i18n.language)}>{t('footer.cookies')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.privacy_link')}>{t('footer.privacy')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.terms_conditions_link')}>{t('footer.terms_conditions')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.modern_slavery_link')}>{t('footer.modern_slavery')}</a>
              </li>
              <li className="menu__item">
                <a href={t('footer.alternative_languages_link')}>{t('footer.alternative_languages')}</a>
              </li>
            </ul>
            <div className="wg-footer-logo"></div>
          </div>
        </footer>

        <script type="module" src="/assets/js/govuk-frontend.min.js" />
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
      </body>
    </html>
  );
};

export default function ConsumerLayout({ children, ...props }: PropsWithChildren<Locals>) {
  return (
    <LocalsProvider {...props}>
      <Layout {...props}>{children}</Layout>
    </LocalsProvider>
  );
}
