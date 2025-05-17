import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';

export default function NumberChooser(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
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
                        <div className="govuk-form-group">
                          <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                              <h2 className="govuk-fieldset__heading">{props.t('publish.number_chooser.question')}</h2>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                              <div className="govuk-radios__item">
                                <input
                                  className="govuk-radios__input"
                                  id="numberTypeInteger"
                                  name="numberType"
                                  type="radio"
                                  value="integer"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="numberTypeInteger">
                                  {props.t('publish.number_chooser.chooser.integer')}
                                </label>
                              </div>
                              <div className="govuk-radios__item">
                                <input
                                  className="govuk-radios__input"
                                  id="numberTypeDecimal"
                                  name="numberType"
                                  type="radio"
                                  value="decimal"
                                  data-aria-controls="conditional-numberTypeDecimal"
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="numberTypeDecimal">
                                  {props.t('publish.number_chooser.chooser.decimal')}
                                </label>
                              </div>
                              <div
                                className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                id="conditional-numberTypeDecimal"
                              >
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
                              </div>
                            </div>
                          </fieldset>
                        </div>
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
          </main>
        </div>
      </div>
    </Layout>
  );
}
