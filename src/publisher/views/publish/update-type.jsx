import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';
import { DataTableAction } from '../../../shared/enums/data-table-action';

export default function UpdateType(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = returnLink;
  const title = props.t('publish.update_type.heading');

  const options = Object.values(DataTableAction).map((action) => ({
    value: action,
    label: <T>{`publish.update_type.${action}`}</T>
  }));

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl" id="update-type-heading">
            {title}
          </h1>
          <form method="post" role="continue" id="updateType">
            <RadioGroup
              name="updateType"
              labelledBy="update-type-heading"
              options={options}
            />

            <div className="govuk-button-group">
              <button
                type="submit"
                name="confirm"
                value="true"
                className="govuk-button"
                data-module="govuk-button"
                style={{ verticalAlign: 'unset' }}
                data-prevent-double-click="true"
              >
                {props.t('buttons.continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
