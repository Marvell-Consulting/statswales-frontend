import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function Login(props) {
  return (
    <Layout {...props}>
      <h1 className="govuk-heading-xl">{props.t('login.heading')}</h1>

      {props.errors && (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
          <div role="alert">
            <h2 className="govuk-error-summary__title">{props.t('errors.problem')}</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {props.errors.map((error, index) => (
                  <li key={index}>
                    <a href="#">{props.t(error)}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="govuk-button-group">
        {props.providers.map((provider, index) => (
          <a key={index} href={`/${props.i18n.language}/auth/${provider}`} className="govuk-button">
            {props.t(`login.buttons.${provider}`)}
          </a>
        ))}
      </div>
    </Layout>
  );
}
