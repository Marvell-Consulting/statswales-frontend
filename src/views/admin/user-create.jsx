import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';

export default function UserCreate(props) {
  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{props.t('admin.user.create.heading')}</h1>

          <ErrorHandler />

          <form encType="multipart/form-data" method="post">
            <div className="govuk-form-group">
              <input
                className={clsx('govuk-input', {
                  'govuk-input--error': props.errors?.find((e) => e.field === 'email')
                })}
                id="email"
                name="email"
                type="email"
                value={props.values.email}
              />
            </div>
            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t(`admin.user.create.buttons.continue`)}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
