import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function YearFormat(props) {
  const backLink = props.referrer;
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <span className="region-subhead">{props.dimension.metadata.name}</span>
            <h1 className="govuk-heading-xl">{props.t('publish.year_format.heading')}</h1>

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
                            id="year-format-1"
                            name="yearType"
                            type="radio"
                            value="YYYY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-1">
                            YYYY
                          </label>
                          <div id="year-format-1-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_format.example', { example: '2024' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-2"
                            name="yearType"
                            type="radio"
                            value="YYYYYY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-2">
                            YYYYYY
                          </label>
                          <div id="year-format-2-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_format.example', { example: '202324' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-3"
                            name="yearType"
                            type="radio"
                            value="YYYYYYYY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-3">
                            YYYYYYYY
                          </label>
                          <div id="year-format-4-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_format.example', { example: '20232024' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-4"
                            name="yearType"
                            type="radio"
                            value="YYYY-YY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-4">
                            YYYY-YY
                          </label>
                          <div id="year-format-4-hint" className="govuk-hint govuk-radios__hint">
                            {props.t('publish.year_format.example', { example: '2023-24' })}
                          </div>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-5"
                            name="yearType"
                            type="radio"
                            value="YYYY/YY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-5">
                            YYYY/YY
                          </label>
                          <div
                            id="year-format-5-hint"
                            className="govuk-hint govuk-radios__hint"
                            dangerouslySetInnerHTML={{
                              __html: props.t('publish.year_format.example', { example: '2023/24' })
                            }}
                          />
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-6"
                            name="yearType"
                            type="radio"
                            value="YYYY-YYYY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-6">
                            YYYY-YYYY
                          </label>
                          <div
                            id="year-format-6-hint"
                            className="govuk-hint govuk-radios__hint"
                            dangerouslySetInnerHTML={{
                              __html: props.t('publish.year_format.example', { example: '2023-2024' })
                            }}
                          />
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="year-format-7"
                            name="yearType"
                            type="radio"
                            value="YYYY/YYYY"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="year-format-7">
                            YYYY/YYYY
                          </label>
                          <div
                            id="year-format-7-hint"
                            className="govuk-hint govuk-radios__hint"
                            dangerouslySetInnerHTML={{
                              __html: props.t('publish.year_format.example', { example: '2023/2024' })
                            }}
                          />
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
