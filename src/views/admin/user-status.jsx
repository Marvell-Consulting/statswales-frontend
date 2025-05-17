import React from 'react';
import Layout from '../components/layouts/Publisher';
import FlashMessages from '../components/FlashMessages';
import ErrorHandler from '../components/ErrorHandler';

export default function UserStatus(props) {
  return (
    <Layout {...props}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <FlashMessages {...props} />
                <ErrorHandler {...props} />

                <h1 className="govuk-heading-xl">
                  {props.t(`admin.user.${props.action}.heading`, { userName: props.userName })}
                </h1>

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
          </main>
        </div>
      </div>
    </Layout>
  );
}
