import React from 'react';
import Layout from '../components/Layout';
import FlashMessages from '../components/FlashMessages';
import ErrorHandler from '../components/ErrorHandler';

export default function UserStatus(props) {
  const title = props.t(`admin.user.${props.action}.heading`, { userName: props.userName });
  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <FlashMessages />
          <ErrorHandler />

          <h1 className="govuk-heading-xl">{title}</h1>

          <p className="govuk-body">{props.t(`admin.user.${props.action}.description`)}</p>

          <form encType="multipart/form-data" method="post">
            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('buttons.continue')}
            </button>{' '}
            <a
              href={props.buildUrl(`/admin/user`, props.i18n.language)}
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              {props.t('buttons.cancel')}
            </a>
          </form>
        </div>
      </div>
    </Layout>
  );
}
