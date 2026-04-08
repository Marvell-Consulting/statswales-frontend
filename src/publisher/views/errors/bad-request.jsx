import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';

export default function BadRequest(props) {
  const title = props.t('errors.bad_request');
  return (
    <Layout {...props} title={title}>
      <ErrorHandler />
      <h1 className="govuk-heading-xl">{title}</h1>
    </Layout>
  );
}
