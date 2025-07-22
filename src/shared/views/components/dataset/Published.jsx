import React from 'react';

export default function Published(props) {
  return (
    <div className="dataset-published">
      <h2 className="govuk-heading-m govuk-!-margin-top-6">{props.t('dataset_view.published.heading')}</h2>

      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.published.org')}</dt>
          <dd className="govuk-summary-list__value">
            {props.published.organisation?.name || props.t('dataset_view.not_entered')}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.published.contact')}</dt>
          <dd className="govuk-summary-list__value"></dd>
        </div>
      </dl>
    </div>
  );
}
