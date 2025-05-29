import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function UserGroupName(props) {
  const nameCyError = props.errors?.find((e) => e.field === 'name_cy');
  const nameEnError = props.errors?.find((e) => e.field === 'name_en');
  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{props.t('admin.group.name.heading')}</h1>
          <ErrorHandler />

          <form encType="multipart/form-data" method="post">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="name_cy">
                {props.t('admin.group.name.form.name_cy.label')}
              </label>
              {nameCyError && (
                <p id="name-cy-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {props.t(nameCyError.message.key)}
                </p>
              )}
              <input
                className={clsx('govuk-input', { 'govuk-input--error': nameCyError })}
                id="name_cy"
                name="name_cy"
                type="text"
                value={props.values.name_cy}
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="name_en">
                {props.t('admin.group.name.form.name_en.label')}
              </label>
              {nameEnError && (
                <p id="name-en-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">Error:</span> {props.t(nameEnError.message.key)}
                </p>
              )}
              <input
                className={clsx('govuk-input', { 'govuk-input--error': nameEnError })}
                id="name_en"
                name="name_en"
                type="text"
                value={props.values.name_en}
              />
            </div>

            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t(`admin.group.name.buttons.${props.isRevisit ? 'continue' : 'create'}`)}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
