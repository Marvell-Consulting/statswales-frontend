import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import Table from '../../../shared/views/components/Table';
import RadioGroup from '../../../shared/views/components/RadioGroup';

export default function DateChooser(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.url.includes('change-format')
    ? props.data
      ? props.referrer
      : props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}/change-type`, props.i18n.language)
    : props.data
      ? props.referrer
      : props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}`, props.i18n.language);

  const columns = props.headers.map((col, index) => ({
    key: index,
    label:
      props.dimension?.extractor &&
      props.t(`publish.time_dimension_review.column_headers.${col.name}`) !==
        `publish.time_dimension_review.column_headers.${col.name}`
        ? props.t(`publish.time_dimension_review.column_headers.${col.name}`)
        : col.name === props.dimension.factTableColumn
          ? props.dimension.metadata.name
          : col.name,
    format: (value) => {
      switch (col.name) {
        case 'date_type':
          if (props.i18n.exists(`publish.time_dimension_review.date_type.${value}`)) {
            return props.t(`publish.time_dimension_review.date_type.${value}`);
          } else {
            return value;
          }
        case 'start_date':
        case 'end_date':
          return props.dateFormat(props.parseISO(value.split('T')[0]), 'do MMMM yyyy', { locale: props.i18n.language });
      }
      return value;
    }
  }));

  const title = props.review
    ? props.t('publish.time_dimension_review.heading')
    : props.t('publish.time_dimension_chooser.heading');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <Table columns={columns} rows={props.data} />
              {props.page_info?.total_records > props.page_size && (
                <p className="govuk-body govuk-hint">
                  {props.t('publish.time_dimension_review.showing', {
                    rows: props.page_size,
                    total: props.page_info.total_records
                  })}
                </p>
              )}
            </div>
          </div>

          {props.review ? (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">{props.t('publish.time_dimension_review.confirm')}</h2>
                    </legend>
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
                  </fieldset>
                </form>
              </div>
            </div>
          ) : (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <RadioGroup
                    name="dimensionType"
                    label={props.t('publish.time_dimension_chooser.question')}
                    options={[
                      {
                        value: 'time_period',
                        label: props.t('publish.time_dimension_chooser.chooser.period'),
                        hint: props.t('publish.time_dimension_chooser.chooser.period-hint')
                      },
                      {
                        value: 'time_point',
                        label: props.t('publish.time_dimension_chooser.chooser.point'),
                        hint: props.t('publish.time_dimension_chooser.chooser.point-hint')
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
          )}
        </>
      )}
    </Layout>
  );
}
