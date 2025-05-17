import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function UserGroupOrg(props) {
  return (
    <Layout {...props} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{props.t('admin.group.organisation.heading')}</h1>
            <ErrorHandler {...props} />

            <form encType="multipart/form-data" method="post">
              <div
                className={clsx('govuk-form-group', {
                  'govuk-input--error': props.errors?.find((e) => e.field === 'organisation_id')
                })}
              >
                <fieldset className="govuk-fieldset" aria-describedby="designation">
                  {props.errors?.find((e) => e.field === 'organisation_id') && (
                    <p id="organisation-id-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{' '}
                      {props.t('admin.group.organisation.form.organisation_id.error')}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    {props.organisations.map((org, index) => (
                      <div key={index} className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id={`organisation_${org.id}`}
                          name="organisation_id"
                          type="radio"
                          value={org.id}
                          defaultChecked={props.values.organisation_id === org.id}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor={`organisation_${org.id}`}>
                          {org.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
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
