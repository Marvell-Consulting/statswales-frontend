import React from 'react';
import Layout from '../../components/layouts/Publisher';
import TranslationsPreviewTable from '../../components/TranslationsPreviewTable';
import ErrorHandler from '../../components/ErrorHandler';

export default function Import(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  const title = props.preview ? props.t('translations.import.heading_preview') : props.t('translations.import.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <h1 className="govuk-heading-xl">{title}</h1>
        {props.preview ? (
          <>
            <TranslationsPreviewTable {...props} isImport={true} />

            <a
              href={props.buildUrl(`/publish/${props.datasetId}/translation/import?confirm=true`, props.i18n.language)}
              className="govuk-button"
              data-module="govuk-button"
              style={{ verticalAlign: 'unset' }}
              data-prevent-double-click="true"
            >
              {props.t('buttons.continue')}
            </a>
          </>
        ) : (
          <>
            <TranslationsPreviewTable {...props} translations={props.existingTranslations} isImport={true} />

            <div className="govuk-inset-text">{props.t('translations.import.note')}</div>

            <ErrorHandler />
            <form
              action={props.buildUrl(`/publish/${props.datasetId}/translation/import`, props.i18n.language)}
              method="post"
              encType="multipart/form-data"
            >
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--s" htmlFor="csv">
                  {props.t('translations.import.form.file.label')}
                </label>
                <input
                  className="govuk-file-upload"
                  id="csv"
                  name="csv"
                  type="file"
                  placeholder=""
                  accept=".csv,text/csv"
                />
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('translations.import.buttons.import')}
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
