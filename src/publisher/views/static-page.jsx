import React from 'react';
import Layout from './components/Layout';
import MarkdownPage from '../../shared/views/components/MarkdownPage';

export default function StaticPage(props) {
  return (
    <Layout {...props}>
      <MarkdownPage {...props} />
    </Layout>
  );
}
