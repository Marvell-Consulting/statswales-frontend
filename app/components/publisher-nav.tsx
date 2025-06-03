import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';
import T from './T';
import { NavLink } from './NavLink';

export const PublisherNav = ({
  isAuthenticated,
  isAdmin,
  isDeveloper
}: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isDeveloper?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <nav className="primary js-primary-nav" aria-label="Primary Navigation">
      <div className="govuk-width-container nav__toggle">
        <LocaleLink path="/">
          <div className="statsWales-logo" role="img" aria-label={t('header.logo')}></div>
        </LocaleLink>
        {isAuthenticated && (
          <LocaleLink
            path="/auth/logout"
            className="button button--secondary ignore-external helper-menu__sign-out"
          >
            {t('header.navigation.logout')}
          </LocaleLink>
        )}
      </div>
      <div className="nav__content">
        <div className="govuk-width-container">
          <ul>
            <li>
              <NavLink to="/" end>
                {t('header.navigation.home')}
              </NavLink>
              {/* <LocaleLink
                path="/"
                className={clsx({ 'is-active': activePage === 'home' })}
                aria-current={activePage === 'home' ? 'page' : undefined}
              >
                {t('header.navigation.home')}
              </LocaleLink> */}
            </li>
            {isAdmin && (
              <>
                <li>
                  <NavLink to="/admin/group">
                    <T>header.navigation.groups</T>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/user">
                    <T>header.navigation.users</T>
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <NavLink to="/guidance">
                <T>header.navigation.guidance</T>
              </NavLink>
            </li>
            {isDeveloper && (
              <li>
                <NavLink to="/developer">
                  <T>header.navigation.developer</T>
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
