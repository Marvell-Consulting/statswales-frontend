import React from 'react';

export default function Notes(props) {
  if (!props.notes.publishedRevisions.length && !props.notes.roundingApplied) {
    return null;
  }

  return (
    <div className="dataset-notes">
      <h2 className="govuk-heading-m govuk-!-margin-top-6">{props.t('dataset_view.notes.heading')}</h2>

      <dl className="govuk-summary-list">
        {props.notes.publishedRevisions.length > 1 && (
          <div id="revisions" className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{props.t('dataset_view.notes.revisions')}</dt>
            <dd className="govuk-summary-list__value">
              <ul className="govuk-list">
                {props.notes.publishedRevisions.map((revision, index) => (
                  <li key={index}>
                    <strong>{props.dateFormat(revision.publish_at, 'd MMMM yyyy')}</strong>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {props.notes.roundingApplied && (
          <div id="data-rounding" className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{props.t('dataset_view.notes.rounding')}</dt>
            <dd
              className="govuk-summary-list__value"
              dangerouslySetInnerHTML={{ __html: props.notes.roundingDescription }}
            />
          </div>
        )}
      </dl>
    </div>
  );
}
