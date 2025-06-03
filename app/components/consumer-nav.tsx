import { LocaleLink } from './LocaleLink';

export const ConsumerNav = () => {
  return (
    <nav className="primary js-primary-nav" aria-label="Primary Navigation">
      <div className="govuk-width-container nav__toggle">
        <LocaleLink path="/published">
          <div className="statsWales-logo" role="img" aria-label="StatsWales logo"></div>
        </LocaleLink>
      </div>
    </nav>
  );
};
