import React from 'react';

export default function About(props) {
  return (
    <div className="dataset-about">
      <h2 className="govuk-heading-m">{props.t('dataset_view.about.overview')}</h2>

      <dl className="govuk-summary-list">
        <div id="summary" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.about.summary')}</dt>
          <dd
            className="govuk-summary-list__value"
            dangerouslySetInnerHTML={{ __html: props.about.summary || props.t('dataset_view.not_entered') }}
          />
        </div>

        <div id="data-collection" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.about.data_collection')}</dt>
          <dd
            className="govuk-summary-list__value"
            dangerouslySetInnerHTML={{ __html: props.about.collection || props.t('dataset_view.not_entered') }}
          />
        </div>

        <div id="data-quality" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.about.statistical_quality')}</dt>
          <dd
            className="govuk-summary-list__value"
            dangerouslySetInnerHTML={{ __html: props.about.quality || props.t('dataset_view.not_entered') }}
          />
        </div>

        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{props.t('dataset_view.about.related_reports')}</dt>
          <dd className="govuk-summary-list__value">
            {props.about.relatedLinks?.length > 0 ? (
              <ul className="govuk-list">
                {props.about.relatedLinks.map((link, index) => (
                  <li key={index}>
                    <a className="govuk-link govuk-link--no-underline" href={link.url} target="_blank">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              props.t('dataset_view.not_entered')
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
