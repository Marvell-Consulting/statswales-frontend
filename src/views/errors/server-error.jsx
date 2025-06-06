import React from 'react';
import Layout from '../components/layouts/Publisher';

export default function ServerError(props) {
  return (
    <Layout {...props}>
      <h1 className="govuk-heading-xl">{props.t('errors.server_error')}</h1>
    </Layout>
  );
}
