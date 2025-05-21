import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';
import DimensionPreviewTable from '../components/DimensionPreviewTable';

export default function DimensionChooser(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{props.t('publish.dimension_type_chooser.heading')}</h1>

      <ErrorHandler {...props} />
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
                <div className="govuk-form-group">
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                      <h2 className="govuk-fieldset__heading">{props.t('publish.dimension_type_chooser.question')}</h2>
                    </legend>
                    <div className="govuk-radios" data-module="govuk-radios">
                      {/* Disabled for private beta while a decision is made on reference data */}
                      {false && (
                        <>
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="dimensionTypeAge"
                              name="dimensionType"
                              type="radio"
                              value="Age"
                              disabled
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeAge">
                              {props.t('publish.dimension_type_chooser.chooser.age')}
                            </label>
                          </div>
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="dimensionTypeEthnicity"
                              name="dimensionType"
                              type="radio"
                              value="Eth"
                              disabled
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeEthnicity">
                              {props.t('publish.dimension_type_chooser.chooser.ethnicity')}
                            </label>
                          </div>
                        </>
                      )}

                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="dimensionTypeDate"
                          name="dimensionType"
                          type="radio"
                          value="Date"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeDate">
                          {props.t('publish.dimension_type_chooser.chooser.date')}
                        </label>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="dimensionTypeGeography"
                          name="dimensionType"
                          type="radio"
                          value="Geog"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeGeography">
                          {props.t('publish.dimension_type_chooser.chooser.geography')}
                        </label>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="dimensionTypeNumber"
                          name="dimensionType"
                          type="radio"
                          value="Number"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeNumber">
                          {props.t('publish.dimension_type_chooser.chooser.number')}
                        </label>
                      </div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="dimensionTypeText"
                          name="dimensionType"
                          type="radio"
                          value="Text"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeText">
                          {props.t('publish.dimension_type_chooser.chooser.text')}
                        </label>
                      </div>
                      {/* Disabled for private beta while a decision is made on reference data */}
                      {false && (
                        <>
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="dimensionTypeReligion"
                              name="dimensionType"
                              type="radio"
                              value="Rlgn"
                              disabled
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeReligion">
                              {props.t('publish.dimension_type_chooser.chooser.religion')}
                            </label>
                          </div>
                          <div className="govuk-radios__item">
                            <input
                              className="govuk-radios__input"
                              id="dimensionTypeSexGender"
                              name="dimensionType"
                              type="radio"
                              value="Gen"
                              disabled
                            />
                            <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeSexGender">
                              {props.t('publish.dimension_type_chooser.chooser.sex_gender')}
                            </label>
                          </div>
                        </>
                      )}
                      <div className="govuk-radios__divider">or</div>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="dimensionTypeTimeLookup"
                          name="dimensionType"
                          type="radio"
                          value="lookup"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="dimensionTypeTimeLookup">
                          {props.t('publish.dimension_type_chooser.chooser.lookup')}
                        </label>
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
        </>
      )}
    </Layout>
  );
}
