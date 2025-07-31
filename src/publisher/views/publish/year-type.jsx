import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';
import { DateField } from '../components/DateField';

export default function YearType(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.revisit
    ? props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/change-format`, props.i18n.language)
    : props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}`, props.i18n.language);

  const title = props.t('publish.year_type.heading');

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
              value={props.yearType}
              options={[
                {
                  value: 'calendar',
                  label: <T>publish.year_type.chooser.calendar</T>,
                  hint: <T>publish.year_type.chooser.calendar-hint</T>
                },
                {
                  value: 'meteorological',
                  label: <T>publish.year_type.chooser.meteorological</T>,
                  hint: <T>publish.year_type.chooser.meteorological-hint</T>
                },
                {
                  value: 'financial',
                  label: <T>publish.year_type.chooser.financial</T>,
                  hint: <T>publish.year_type.chooser.financial-hint</T>
                },
                {
                  value: 'tax',
                  label: <T>publish.year_type.chooser.tax</T>,
                  hint: <T>publish.year_type.chooser.tax-hint</T>
                },
                {
                  value: 'academic',
                  label: <T>publish.year_type.chooser.academic</T>,
                  hint: <T>publish.year_type.chooser.academic-hint</T>
                },
                {
                  value: 'rolling',
                  label: <T>publish.year_type.chooser.rolling</T>,
                  hint: <T>publish.year_type.chooser.rolling-hint</T>,
                  children: (
                    <div className="govuk-form-group">
                      <label className="govuk-label">
                        <T>publish.year_type.chooser.rolling-start-date</T>
                      </label>
                      <div className="govuk-hint">
                        <T>publish.year_type.chooser.rolling-start-date-hint</T>
                      </div>
                      <div className="govuk-date-input">
                        <DateField name="start_day" label={<T>publish.year_type.chooser.day</T>} />
                        <DateField name="start_month" label={<T>publish.year_type.chooser.month</T>} />
                      </div>
                    </div>
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
