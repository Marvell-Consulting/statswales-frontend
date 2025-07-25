import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import MeasurePreviewTable from '../components/MeasurePreviewTable';

export default function MeasurePreview(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.url.includes('change-lookup')
    ? props.buildUrl(`/publish/${props.datasetId}/measure`, props.i18n.language)
    : returnLink;
  const title = props.t('publish.measure_preview.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.measure.metadata.name}</span>
      <h1 className="govuk-heading-xl">{title}</h1>
      <ErrorHandler />
      {props.data && !props.errors && (
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
          <form method="post" role="continue" encType="multipart/form-data">
            <fieldset className="govuk-fieldset">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="csv">
                  {props.t('publish.upload.form.file.label')}
                </label>
                <input
                  className="govuk-file-upload"
                  id="csv"
                  name="csv"
                  type="file"
                  placeholder="Upload Data Files!"
                  accept={props.supportedFormats}
                />
              </div>
              <div className="govuk-form-group">
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
                    {props.t('buttons.upload_csv')}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </Layout>
  );
}
