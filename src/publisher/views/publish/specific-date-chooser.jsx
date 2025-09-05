import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';

export default function SpecificDateChooser(props) {
  const backLink = props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  const title = props.t('publish.point_in_time.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="date-format">
        {title}
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="dateFormat"
              labelledBy="date-format"
              options={[
                {
                  value: 'dd/MM/yyyy',
                  label: 'DD/MM/YYYY',
                  hint: (
                    // slashes need escaping
                    <T example="14/10/2024" raw>
                      publish.point_in_time.example
                    </T>
                  )
                },
                {
                  value: 'dd-MM-yyyy',
                  label: 'DD-MM-YYYY',
                  hint: <T example="14-10-2024">publish.point_in_time.example</T>
                },
                {
                  value: 'yyyy-MM-dd',
                  label: 'YYYY-MM-DD',
                  hint: <T example="2024-10-14">publish.point_in_time.example</T>
                },
                {
                  value: 'yyyyMMdd',
                  label: 'YYYYMMDD',
                  hint: <T example="20241014">publish.point_in_time.example</T>
                }
              ]}
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
                <T>buttons.continue</T>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
