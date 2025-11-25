import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/Layout';
import { clsx } from 'clsx';

export default function UpdateReason(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;

  const title = props.t('publish.update_reason.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form encType="multipart/form-data" method="post">
              <h1 className="govuk-heading-xl">
                <label htmlFor="update_reason">{title}</label>
              </h1>

              <ErrorHandler />

              <p className="govuk-body">{props.t('publish.update_reason.description')}</p>

              <p id="update_reason_explain" className="govuk-body">
                {props.t('publish.update_reason.explain')}
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>{props.t('publish.update_reason.explain_1')}</li>
                <li>{props.t('publish.update_reason.explain_2')}</li>
              </ul>

              <div className="govuk-hint">{props.t('publish.update_reason.language')}</div>

              <div
                className={clsx('govuk-form-group', {
                  'govuk-form-group--error': props.errors?.find((e) => e.field === 'update_reason')
                })}
              >
                <textarea
                  className={clsx('govuk-textarea', {
                    'govuk-textarea--error': props.errors?.find((e) => e.field === 'update_reason')
                  })}
                  id="update_reason"
                  name="update_reason"
                  rows="15"
                  defaultValue={props.update_reason}
                  aria-describedby="update_reason_explain"
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
