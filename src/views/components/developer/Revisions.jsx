import React, { Fragment } from 'react';

export default function Revisions(props) {
  return (
    <div className="govuk-accordion__section">
      <div className="govuk-accordion__section-header">
        <h2 className="govuk-accordion__section-heading">
          <span className="govuk-accordion__section-button" id="accordion-default-heading-4">
            {props.t('developer.display.revision')}
          </span>
        </h2>
      </div>
      <div id="accordion-default-content-4" className="govuk-accordion__section-content">
        {props.dataset?.revisions?.map((rev) => (
          <Fragment key={rev.id}>
            <p className="govuk-body">
              <strong>ID:</strong> {rev.id}
            </p>
            <p className="govuk-body">
              <strong>{props.t('developer.display.index')}:</strong> {rev.revision_index}
            </p>
            <p className="govuk-body">
              <strong>{props.t('developer.display.created_at')}:</strong> {rev.created_at}
            </p>
            <p className="govuk-body">
              <strong>{props.t('developer.display.created_by')}:</strong> {rev.created_by}
            </p>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
