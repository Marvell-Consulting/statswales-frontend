import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function MonthFormat(props) {
  const backLink = props.buildUrl(
    `/publish/${props.datasetId}/dates/${props.dimension.id}/period/type`,
    props.i18n.language
  );
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <span className="region-subhead">{props.dimension.metadata.name}</span>
            <h1 className="govuk-heading-xl">{props.t('publish.month_format.heading')}</h1>

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
                            id="month-format-1"
                            name="monthFormat"
                            type="radio"
                            value="MMM"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="month-format-1">
                            MMM
                          </label>
                          <div id="month-format-1-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.month_format.example', { example: 'Jan' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="month-format-2"
                            name="monthFormat"
                            type="radio"
                            value="mMM"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="month-format-2">
                            mMM
                          </label>
                          <div id="month-format-4-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.month_format.example', { example: 'm01' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="month-format-3"
                            name="monthFormat"
                            type="radio"
                            value="mm"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="month-format-3">
                            MM
                          </label>
                          <div id="quarter-format-3-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.month_format.example', { example: '01' })}
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
