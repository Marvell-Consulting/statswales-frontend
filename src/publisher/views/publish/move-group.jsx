import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../components/RadioGroup';

export default function MoveGroup(props) {
  const title = props.t('publish.move_group.heading');
  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl" id="move-group">
            {title}
          </h1>

          <form encType="multipart/form-data" method="post">
            <ErrorHandler />

            <RadioGroup
              name="group_id"
              labelledBy="move-group"
              options={props.availableGroups.map((group) => ({
                value: group.id,
                label: group.name
              }))}
              value={props.values.group_id}
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
