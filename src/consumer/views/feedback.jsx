import React from 'react';
import Layout from './components/Layout';
import FeedbackForm from './components/FeedbackForm';

export default function Feedback(props) {
  return (
    <Layout {...props}>
      <FeedbackForm {...props} />
    </Layout>
  );
}
