import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function Title(props) {
  const backLink = props.revisit && props.referrer;
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const title =
    props.uploadType === 'lookup'
      ? props.t('publish.upload.lookup_heading')
      : props.uploadType === 'measure'
        ? props.t('publish.upload.measure_heading')
        : props.t('publish.upload.title');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

      <form method="post" encType="multipart/form-data">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="csv">
            {props.t('publish.upload.form.file.label')}
          </label>
          <input
            className="govuk-file-upload"
            id="csv"
            name="csv"
            type="file"
            placeholder="Upload file"
            accept={props.supportedFormats}
          />
        </div>
        <div className="govuk-button-group">
          <input type="hidden" name="updateType" value={props.updateType} />
          <input type="hidden" name="test" value="test" />
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
            style={{ verticalAlign: 'unset' }}
            data-prevent-double-click="true"
          >
            {props.t('publish.upload.buttons.upload')}
          </button>
        </div>
      </form>
    </Layout>
  );
}
