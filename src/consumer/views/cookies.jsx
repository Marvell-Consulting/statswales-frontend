import React from 'react';
import Layout from './components/Layout';
import CookieSettings from '../../shared/views/components/CookieSettings';

export default function Cookies(props) {
  return (
    <Layout {...props}>
      <CookieSettings {...props} />
    </Layout>
  );
}
