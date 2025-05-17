import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function Forbidden(props) {
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">{props.t('errors.forbidden.heading')}</h1>

          <p className="govuk-body">{props.t('errors.forbidden.description')}</p>
        </main>
      </div>
    </Layout>
  );
}
