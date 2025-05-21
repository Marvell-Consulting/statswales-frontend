import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import clsx from 'clsx';
import RadioGroup from '../components/RadioGroup';

export default function MoveGroup(props) {
  return (
    <Layout {...props} formPage>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl" id="move-group">
            {props.t('publish.move_group.heading')}
          </h1>

          <form encType="multipart/form-data" method="post">
            <ErrorHandler {...props} />

            <RadioGroup
              {...props}
              name="group_id"
              labelledBy="move-group"
              options={props.availableGroups.map((group) => ({
                value: group.id,
                label: group.name
              }))}
              value={values.group_id}
            />

            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('buttons.continue')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
