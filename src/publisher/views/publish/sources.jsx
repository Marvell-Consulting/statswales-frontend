import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import T from '../../../shared/views/components/T';
import Select from '../../../shared/views/components/Select';

export default function Sources(props) {
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  const sourceOptions = props.sourceTypes.map((val) => ({
    value: val,
    label: props.t(`publish.sources.types.${val}`)
  }));

  const title = props.t('publish.sources.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
      <ErrorHandler />
      <form action={props.buildUrl(`/publish/${props.datasetId}/sources`, props.i18n.language)} method="post">
        <div
          className="source-list"
          style={{
            marginBottom: '2em'
          }}
        >
          {props.factTable.map((source, idx) => (
            <div
              key={idx}
              className="source-list-item"
              style={{
                borderBottom: '1px solid #0b0c0c',
                paddingBottom: '0.5em',
                marginBottom: '0.5em'
              }}
            >
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <Select
                    name={`column-${source.index}`}
                    className="govuk-!-display-inline"
                    label={source.name || <T colNum={idx + 1}>publish.preview.unnamed_column</T>}
                    labelClassName="govuk-label--s"
                    labelStyle={{ minWidth: '30%', display: 'inline-block' }}
                    options={sourceOptions}
                    value={source.type}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div className="govuk-button-group">
              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('buttons.continue')}
              </button>
              <a
                className="govuk-button govuk-button--secondary"
                href={props.buildUrl(`/publish/${props.datasetId}/upload`, props.i18n.language)}
              >
                {props.t('publish.preview.buttons.choose_different')}
              </a>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}
