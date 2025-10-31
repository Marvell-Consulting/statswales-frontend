import React from 'react';
import Layout from '../components/Layout';
import { clsx } from 'clsx';

export default function LocalAuth(props) {
  const title = props.t('login.heading');
  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{title}</h1>
          <div
            className="govuk-notification-banner"
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
          >
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                {props.t('login.form.notice_header')}
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">{props.t('login.form.notice_1')}</p>
              <p className="govuk-notification-banner__heading">{props.t('login.form.notice_2')}</p>
            </div>
          </div>

          <form method="post">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="username">
                {props.t('login.form.username.label')}
              </label>
              {props.errors?.find((e) => e.field === 'username') && (
                <p id="quality-error" className="govuk-error-message">
                  {props.t('login.form.username.error')}
                </p>
              )}
              <input
                className={clsx('govuk-input', {
                  'govuk-input--error': props.errors?.find((e) => e.field === 'username')
                })}
                id="username"
                name="username"
                type="text"
                defaultValue={props.username}
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
