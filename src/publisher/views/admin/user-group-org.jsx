import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';

export default function UserGroupOrg(props) {
  const title = props.t('admin.group.organisation.heading');
  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl" id="organisation">
              {title}
            </h1>
            <ErrorHandler />

            <form encType="multipart/form-data" method="post">
              <RadioGroup
                name="organisation_id"
                labelledBy="organisation"
                options={props.organisations.map((org) => ({ value: org.id, label: org.name }))}
                value={props.values.organisation_id}
                errorMessage={props.t('admin.group.organisation.form.organisation_id.error')}
              />

              <button type="submit" className="govuk-button" data-module="govuk-button">
                {props.t('buttons.continue')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
