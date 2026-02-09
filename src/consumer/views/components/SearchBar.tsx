import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';

export default function SearchBar() {
  const { buildUrl, i18n, t } = useLocals();

  return (
    <div className="search-bar">
      <form action={buildUrl('/search', i18n.language)} method="get" role="search">
        <label htmlFor="search-bar-input" className="visually-hidden">
          {t('header.search.label')}
        </label>
        <input type="text" id="search-bar-input" name="keywords" autoComplete="off" className="govuk-input" />
        <button type="submit" className="govuk-button" aria-label={t('header.search.button')}></button>
      </form>
    </div>
  );
}
