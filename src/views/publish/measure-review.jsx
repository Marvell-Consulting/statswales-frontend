import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import MeasurePreviewTable from '../components/MeasurePreviewTable';
import Layout from '../components/layouts/Publisher';

export default function MeasureReview(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-width-container app-width-container">
            <span className="region-subhead">{props.measure.metadata.name}</span>
            <h1 className="govuk-heading-xl">{props.t('publish.measure_review.heading')}</h1>

            <ErrorHandler {...props} />

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <p className="govuk-body">{props.t('publish.measure_review.explain')}</p>
              </div>
            </div>

            {props.data && (
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full with-overflow">
                  <MeasurePreviewTable {...props} />
                  {props.page_info?.total_records > props.page_size && (
                    <p className="govuk-body govuk-hint">
                      {props.t('publish.measure_review.showing', {
                        rows: props.page_size,
                        total: props.page_info.total_records
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">{props.t('publish.measure_review.confirm')}</h2>
                    </legend>
                    <div className="govuk-button-group">
                      <button
                        type="submit"
                        name="confirm"
                        value="continue"
                        className="govuk-button"
                        data-module="govuk-button"
                        style={{ verticalAlign: 'unset' }}
                        data-prevent-double-click="true"
                      >
                        {props.t('buttons.continue')}
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
