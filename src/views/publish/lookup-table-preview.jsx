import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';

export default function LookupTablePreview(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const backLink = props.revisit
    ? props.dimension.type === 'text'
      ? props.buildUrl(`publish/${props.datasetId}/dimension/${props.dimension.id}/change-type`)
      : props.dimension.type === 'numbers'
        ? props.buildUrl(`publish/${props.datasetId}/numbers/${props.dimension.id}/change-type`)
        : props.referrer
    : props.dimension.type === 'text'
      ? props.buildUrl(`publish/${props.datasetId}/dimension/${props.dimension.id}`)
      : props.dimension.type === 'numbers'
        ? props.buildUrl(`publish/${props.datasetId}/numbers/${props.dimension.id}`)
        : props.referrer;

  const title = props.t(
    `publish.lookup_table_review.${props.dimension.type === 'lookup_table' ? 'heading' : 'dimension_heading'}`
  );

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

      {props.dimension.type === 'lookup_table' && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body">{props.t('publish.lookup_table_review.explain')}</p>
          </div>
        </div>
      )}

      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <DimensionPreviewTable {...props} />
              {props.page_info?.total_records > props.page_size && (
                <p className="govuk-body govuk-hint">
                  {props.t('publish.lookup_table_review.showing', {
                    rows: props.page_size,
                    total: props.page_info.total_records
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <form method="post" role="continue">
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                    <h2 className="govuk-fieldset__heading">
                      {props.t(
                        `publish.lookup_table_review.${
                          props.dimension.type === 'lookup_table' ? 'confirm' : 'dimension_confirm'
                        }`
                      )}
                    </h2>
                  </legend>
                  <div className="govuk-button-group">
                    <button
                      type="submit"
                      name="confirm"
                      value="true"
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
        </>
      )}
    </Layout>
  );
}
