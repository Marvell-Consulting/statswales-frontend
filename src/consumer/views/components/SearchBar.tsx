import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';
import { isFeatureEnabled } from '../../../shared/utils/feature-flags';
import { FeatureFlag } from '../../../shared/enums/feature-flag';

export default function SearchBar() {
  const { buildUrl, i18n, t, protocol, hostname, url } = useLocals();
  const urlObj = new URL(url, `${protocol}://${hostname}`);

  if (!isFeatureEnabled(urlObj.searchParams, FeatureFlag.Search)) {
    return null;
  }

  return (
    <div className="search-bar">
      <form action={buildUrl('/search', i18n.language)} method="get" role="search">
        <label htmlFor="search-bar-input" className="visually-hidden">
          {t('header.search.label')}
        </label>
        <input type="text" id="search-bar-input" name="keywords" autoComplete="off" className="govuk-input" />
        <input type="hidden" name="feature" value="search" />
        <button type="submit" className="govuk-button" aria-label={t('header.search.button')}></button>
      </form>
    </div>
  );
}
