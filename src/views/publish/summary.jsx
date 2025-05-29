import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';
import clsx from 'clsx';

export default function Summary(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{props.t('publish.summary.heading')}</h1>

            <ErrorHandler {...props} />

            <p className="govuk-body">{props.t('publish.summary.explain')}</p>

            <ul className="govuk-list govuk-list--bullet">
              <li>{props.t('publish.summary.explain_1')}</li>
              <li>{props.t('publish.summary.explain_2')}</li>
            </ul>

            <div className="govuk-hint">{props.t('publish.summary.language')}</div>

            <form encType="multipart/form-data" method="post">
              <div className="govuk-form-group">
                <textarea
                  className={clsx('govuk-textarea', {
                    'govuk-textarea--error': props.errors?.find((e) => e.field === 'summary')
                  })}
                  id="summary"
                  name="summary"
                  rows="15"
                  defaultValue={props.summary}
                />
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('buttons.continue')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
