import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function Sources(props) {
  const backLink = props.revisit && 'javascript:history.back()';
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <h1 className="govuk-heading-xl">{props.t('publish.sources.heading')}</h1>
      <ErrorHandler {...props} />
      <form action={props.buildUrl(`/publish/${props.datasetId}/sources`, props.i18n.language)} method="post">
        <div
          className="source-list"
          style={{
            marginBottom: '2em'
          }}
        >
          {props.factTable.map((source, idx) => (
            <div
              className="source-list-item"
              style={{
                borderBottom: '1px solid #0b0c0c',
                paddingBottom: '0.5em',
                marginBottom: '0.5em'
              }}
            >
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <span
                    style={{
                      minWidth: '30%',
                      display: 'inline-block'
                    }}
                  >
                    <label className="govuk-label govuk-!-display-inline" htmlFor={`column-${source.index}`}>
                      <strong>{source.name || props.t('publish.preview.unnamed_column', { colNum: idx + 1 })}</strong>
                    </label>
                  </span>
                  <select
                    className="govuk-select govuk-!-display-inline"
                    id={`column-${source.index}`}
                    name={`column-${source.index}`}
                  >
                    {props.sourceTypes.map((val) => (
                      <option value={val} selected={source.type === val}>
                        {props.t(`publish.sources.types.${val}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <p className="govuk-body">
              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('buttons.continue')}
              </button>
            </p>
          </div>
        </div>
      </form>
    </Layout>
  );
}
