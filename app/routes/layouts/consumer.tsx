import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import FlashMessages from '~/components/FlashMessages';
import ErrorHandler from '~/components/ErrorHandler';
import { ConsumerNav } from '~/components/consumer-nav';

export default function Layout() {
  const { t } = useTranslation();
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
    <>
      <ConsumerNav />
      <hr className="govuk-section-break govuk-section-break--l govuk-!-margin-bottom-0 govuk-section-break--visible" />
      <main className="govuk-main-wrapper govuk-!-padding-top-0" id="main-content" role="main">
        <div className="govuk-width-container">
          <FlashMessages />
          <ErrorHandler />
          <Outlet />
        </div>
      </main>
      <footer className="wg-footer">
        <div className="govuk-width-container govuk-!-padding-top-9">
          <ul className="footer-menu govuk-list">
            {links.map((link, index) => (
              <li key={index} className="govuk-footer__inline-list-item">
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
    </>
  );
}
