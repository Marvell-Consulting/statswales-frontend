import React from 'react';
import Layout from '../components/Layout';

export default function ServerError(props) {
  const title = props.t('errors.server_error');
  return (
    <Layout {...props} title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>
    </Layout>
  );
}
