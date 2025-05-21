import React from 'react';

export default function ErrorHandler({ errors, t }) {
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <div className="govuk-error-summary" data-module="govuk-error-summary">
      <div role="alert">
        <h2 className="govuk-error-summary__title">{t('errors.problem')}</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map((error) => (
              <li key={error.message.key}>
                <a href={`#${error.field}`}>{t(error.message.key, error.message.params)}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
