import React from 'react';
import Layout from '../../components/Layout';
import TranslationsPreviewTable from '../../components/TranslationsPreviewTable';

export default function Export(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const title = props.t('translations.export.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} title={title}>
      <div className="govuk-width-container">
        <h1 className="govuk-heading-xl">{title}</h1>

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
    </Layout>
  );
}
