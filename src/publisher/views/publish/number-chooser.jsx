import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';
import RadioGroup from '../components/RadioGroup';
import T from '../components/T';
import Select from '../../../shared/views/components/Select';

export default function NumberChooser(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.revisit
    ? props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}/change-type`, props.i18n.language)
    : props.buildUrl(`/publish/${props.datasetId}/dimension/${props.dimension.id}`, props.i18n.language);

  const title = props.review
    ? props.t('publish.number_chooser.heading')
    : props.t('publish.number_chooser.review_heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

      {props.data && (
        <>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full with-overflow">
              <DimensionPreviewTable {...props} />
              {props.page_info?.total_records > props.page_size && (
                <p className="govuk-body govuk-hint">
                  {props.t('publish.number_chooser.showing', {
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
                      <h2 className="govuk-fieldset__heading">{props.t('publish.number_chooser.confirm')}</h2>
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
                    name="numberType"
                    label={props.t('publish.number_chooser.question')}
                    options={[
                      {
                        value: 'integer',
                        label: props.t('publish.number_chooser.chooser.integer')
                      },
                      {
                        value: 'decimal',
                        label: props.t('publish.number_chooser.chooser.decimal'),
                        children: (
                          <Select
                            name="decimalPlaces"
                            label={<T>publish.number_chooser.chooser.decimal_places</T>}
                            options={[1, 2, 3, 4, 5, 6, 7, 8]}
                            value={2}
                          />
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
          )}
        </>
      )}
    </Layout>
  );
}
