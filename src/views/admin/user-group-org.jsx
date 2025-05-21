import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';
import RadioGroup from '../components/RadioGroup';

export default function UserGroupOrg(props) {
  return (
    <Layout {...props} formPage>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl" id="organisation">
              {props.t('admin.group.organisation.heading')}
            </h1>
            <ErrorHandler {...props} />

            <form encType="multipart/form-data" method="post">
              <RadioGroup
                {...props}
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
