import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function UserGroupEmail(props) {
  const emailCyError = props.errors?.find((e) => e.field === 'email_cy');
  const emailEnError = props.errors?.find((e) => e.field === 'email_en');
  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{props.t('admin.group.email.heading')}</h1>

          <ErrorHandler />

          <form encType="multipart/form-data" method="post">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="email_cy">
                {props.t('admin.group.email.form.email_cy.label')}
              </label>
              {emailCyError && (
                <p id="email-cy-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {props.t(emailCyError.message.key)}
                </p>
              )}
              <input
                className={clsx('govuk-input', { 'govuk-input--error': emailCyError })}
                id="email_cy"
                name="email_cy"
                type="email"
                value={props.values.email_cy}
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="email_en">
                {props.t('admin.group.email.form.email_en.label')}
              </label>
              {emailEnError && (
                <p id="email-en-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {props.t(emailEnError.message.key)}
                </p>
              )}

              <input
                className={clsx('govuk-input', { 'govuk-input--error': emailEnError })}
                id="email_en"
                name="email_en"
                type="email"
                value={props.values.email_en}
              />
            </div>

            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('buttons.continue')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
