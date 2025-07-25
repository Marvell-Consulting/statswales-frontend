import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';

export default function YearFormat(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.buildUrl(
    `/publish/${props.datasetId}/dates/${props.dimension.id}/period`,
    props.i18n.language
  );

  const title = props.t('publish.year_format.heading');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="year-type">
        {title}
      </h1>

      <ErrorHandler />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <RadioGroup
              name="yearType"
              labelledBy="year-type"
              options={[
                {
                  value: 'YYYY',
                  label: 'YYYY',
                  hint: <T example="2024">publish.year_format.example</T>
                },
                {
                  value: 'YYYYYY',
                  label: 'YYYYYY',
                  hint: <T example="202324">publish.year_format.example</T>
                },
                {
                  value: 'YYYYYYYY',
                  label: 'YYYYYYYY',
                  hint: <T example="20232024">publish.year_format.example</T>
                },
                {
                  value: 'YYYY-YY',
                  label: 'YYYY-YY',
                  hint: <T example="2023-24">publish.year_format.example</T>
                },
                {
                  value: 'YYYY/YY',
                  label: 'YYYY/YY',
                  // slashes need escaping
                  hint: (
                    <T example="2023/24" raw>
                      publish.year_format.example
                    </T>
                  )
                },
                {
                  value: 'YYYY-YYYY',
                  label: 'YYYY-YYYY',
                  hint: <T example="2023-2024">publish.year_format.example</T>
                },
                {
                  value: 'YYYY/YYYY',
                  label: 'YYYY/YYYY',
                  // slashes need escaping
                  hint: (
                    <T example="2023/2024" raw>
                      publish.year_format.example
                    </T>
                  )
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
                {props.t('buttons.continue')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
