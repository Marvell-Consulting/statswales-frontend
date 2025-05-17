import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function ServerError(props) {
  return (
    <Layout {...props}>
      <div className="govuk-width-container app-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <h1 className="govuk-heading-xl">{props.t('errors.server_error')}</h1>
        </main>
      </div>
    </Layout>
  );
}
