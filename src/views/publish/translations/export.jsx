import React from 'react';
import Layout from '../../components/layouts/Publisher';
import TranslationsPreviewTable from '../../components/TranslationsPreviewTable';

export default function Export(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-width-container">
            <h1 className="govuk-heading-xl">{props.t('translations.export.heading')}</h1>

            <TranslationsPreviewTable {...props} isImport={false} />

            <div className="govuk-button-group">
              <a
                href={props.buildUrl(`/publish/${props.datasetId}/translation/export?format=csv`, props.i18n.language)}
                className="govuk-button"
              >
                {props.t('translations.export.buttons.export')}
              </a>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
