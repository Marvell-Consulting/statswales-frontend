import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function YearType(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <span className="region-subhead">{props.dimension.metadata.name}</span>
            <h1 className="govuk-heading-xl">{props.t('publish.year_type.heading')}</h1>

            <ErrorHandler {...props} />

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue">
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset">
                      <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="yearTypeCalendar"
                            name="yearType"
                            type="radio"
                            value="calendar"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="yearTypeCalendar">
                            {props.t('publish.year_type.chooser.calendar')}
                          </label>
                          <div id="yearTypeCalendar-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_type.chooser.calendar-hint')}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="yearTypeMeteorological"
                            name="yearType"
                            type="radio"
                            value="meteorological"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="yearTypeMeteorological">
                            {props.t('publish.year_type.chooser.meteorological')}
                          </label>
                          <div id="yearTypeMeteorological-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_type.chooser.meteorological-hint')}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="yearTypeFinancial"
                            name="yearType"
                            type="radio"
                            value="financial"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="yearTypeFinancial">
                            {props.t('publish.year_type.chooser.financial')}
                          </label>
                          <div id="yearTypeFinancial-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_type.chooser.financial-hint')}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="yearTypeTax"
                            name="yearType"
                            type="radio"
                            value="tax"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="yearTypeTax">
                            {props.t('publish.year_type.chooser.tax')}
                          </label>
                          <div id="yearTypeTax-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_type.chooser.tax-hint')}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="yearTypeAcademic"
                            name="yearType"
                            type="radio"
                            value="academic"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="yearTypeAcademic">
                            {props.t('publish.year_type.chooser.academic')}
                          </label>
                          <div id="yearTypeAcademic-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_type.chooser.academic-hint')}
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
          </main>
        </div>
      </div>
    </Layout>
  );
}
