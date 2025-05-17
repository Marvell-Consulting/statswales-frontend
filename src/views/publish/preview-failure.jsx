import React from 'react';
import Layout from '../components/layouts/Publisher';
import DatasetStatus from '../components/dataset/DatasetStatus';

export default function PreviewFailure(props) {
  return (
    <Layout {...props}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            {props.t('errors.preview_failure.heading', { datasetTitle })}
          </h1>
        </div>
      </div>

      <DatasetStatus {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="warning-background">
            <div className="govuk-error-message alert-warning">
              <h2 className="govuk-heading-l">{props.t('errors.preview_failure.message')}</h2>

              <p className="govuk-heading-s">{props.t('errors.preview_failure.error')}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
