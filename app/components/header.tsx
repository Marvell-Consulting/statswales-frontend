import { Locale } from '~/enums/locale';
import { LocaleLink } from './LocaleLink';
import { useTranslation } from 'react-i18next';
import T from './T';

export const Header = () => {
  const { i18n } = useTranslation();
  return (
    <header id="wg-header" className="wg-header" style={{ backgroundColor: '#323232' }}>
      <div className="layout-container">
        <div className="header" id="header">
          <div className="header__components container-fluid">
            <div id="block-govwales-branding">
              <LocaleLink
                path="/published"
                title="Welsh Government"
                className="header__logo"
                id="logo"
              >
                <T className="visually-hidden">consumer.global.home_label</T>
              </LocaleLink>
            </div>
            <div
              className="language-switcher-language-url"
              id="block-govwales-languageswitcher"
              role="navigation"
              aria-label="Language"
            >
              <ul className="links">
                {[Locale.English, Locale.EnglishGb].includes(i18n.language as Locale) ? (
                  <li className="cy">
                    <LocaleLink
                      className="language-link"
                      lang="cy"
                      hrefLang="cy"
                      query={{ lang: Locale.WelshGb }}
                      role="button"
                    >
                      Cymraeg
                    </LocaleLink>
                  </li>
                ) : (
                  <li className="en">
                    <LocaleLink
                      className="language-link"
                      lang="en"
                      hrefLang="en"
                      query={{ lang: Locale.EnglishGb }}
                      role="button"
                    >
                      English
                    </LocaleLink>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
