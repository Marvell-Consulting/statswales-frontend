import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';
import RadioGroup from '../components/RadioGroup';

export default function NumberChooser(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      {props.review ? (
        <h1 className="govuk-heading-xl">{props.t('publish.number_chooser.heading')}</h1>
      ) : (
        <h1 className="govuk-heading-xl">{props.t('publish.number_chooser.review_heading')}</h1>
      )}

      <ErrorHandler {...props} />

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
                          <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="decimalPlaces">
                              {props.t('publish.number_chooser.chooser.decimal_places')}
                            </label>
                            <select className="govuk-select" id="decimalPlaces" name="decimalPlaces">
                              <option value="1">1</option>
                              <option value="2" selected>
                                2
                              </option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                              <option value="5">5</option>
                              <option value="6">6</option>
                              <option value="7">7</option>
                              <option value="8">8</option>
                            </select>
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
          )}
        </>
      )}
    </Layout>
  );
}
