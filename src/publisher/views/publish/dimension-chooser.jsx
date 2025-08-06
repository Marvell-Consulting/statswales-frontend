import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';
import RadioGroup from '../../../shared/views/components/RadioGroup';

export default function DimensionChooser(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.url.includes('change-type')
    ? props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}`, props.i18n.language)
    : returnLink;

  const title = props.t('publish.dimension_type_chooser.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl" id="dimension-type">
        {title}
      </h1>

      <ErrorHandler />
      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <DimensionPreviewTable {...props} />
              {props.page_info?.total_records > props.page_size && (
                <p className="govuk-body govuk-hint">
                  {props.t('publish.lookup_table_review.showing', {
                    rows: props.page_size,
                    total: props.page_info.total_records
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <form method="post" role="continue">
                <RadioGroup
                  name="dimensionType"
                  label={props.t('publish.dimension_type_chooser.question')}
                  labelledBy="dimension-type"
                  options={[
                    // Disabled for private beta while a decision is made on reference data
                    ...(false
                      ? [
                          {
                            value: 'Age',
                            label: props.t('publish.dimension_type_chooser.chooser.age'),
                            disabled: true
                          },
                          {
                            value: 'Eth',
                            label: props.t('publish.dimension_type_chooser.chooser.ethnicity'),
                            disabled: true
                          }
                        ]
                      : []),
                    {
                      value: 'Date',
                      label: props.t('publish.dimension_type_chooser.chooser.date')
                    },
                    ...(false
                      ? [
                          {
                            value: 'Geog',
                            label: props.t('publish.dimension_type_chooser.chooser.geography')
                          }
                        ]
                      : []),
                    {
                      value: 'Number',
                      label: props.t('publish.dimension_type_chooser.chooser.number')
                    },
                    {
                      value: 'Text',
                      label: props.t('publish.dimension_type_chooser.chooser.text')
                    },
                    // Disabled for private beta while a decision is made on reference data
                    ...(false
                      ? [
                          {
                            value: 'Rlgn',
                            label: props.t('publish.dimension_type_chooser.chooser.religion'),
                            disabled: true
                          },
                          {
                            value: 'Gen',
                            label: props.t('publish.dimension_type_chooser.chooser.sex_gender'),
                            disabled: true
                          }
                        ]
                      : []),
                    {
                      divider: 'or'
                    },
                    {
                      value: 'lookup',
                      label: props.t('publish.dimension_type_chooser.chooser.lookup')
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
        </>
      )}
    </Layout>
  );
}
