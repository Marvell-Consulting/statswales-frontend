import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function SpecificDateChooser(props) {
  const backLink = props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      <h1 className="govuk-heading-xl">{props.t('publish.point_in_time.heading')}</h1>

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
                      id="quarter-format-2"
                      name="dateFormat"
                      type="radio"
                      value="dd/MM/yyyy"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="quarter-format-2">
                      DD/MM/YYYY
                    </label>
                    <div
                      id="quarter-format-2-hint"
                      className="govuk-hint govuk-radios__hint"
                      dangerouslySetInnerHTML={{
                        __html: props.t('publish.point_in_time.example', { example: '14/10/2024' })
                      }}
                    />
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="quarter-format-3"
                      name="dateFormat"
                      type="radio"
                      value="dd-MM-yyyy"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="quarter-format-3">
                      DD-MM-YYYY
                    </label>
                    <div id="quarter-format-4-hint" className="govuk-hint govuk-radios__hint">
                      {props.t('publish.point_in_time.example', { example: '14-10-2024' })}
                    </div>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="quarter-format-4"
                      name="dateFormat"
                      type="radio"
                      value="-yyyy-MM-dd"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="quarter-format-4">
                      YYYY-MM-DD
                    </label>
                    <div id="quarter-format-4-hint" className="govuk-hint govuk-radios__hint">
                      {props.t('publish.point_in_time.example', { example: '2024-10-14' })}
                    </div>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="quarter-format-5"
                      name="dateFormat"
                      type="radio"
                      value="yyyyMMdd"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="quarter-format-5">
                      YYYYMMDD
                    </label>
                    <div id="quarter-format-5-hint" className="govuk-hint govuk-radios__hint">
                      {props.t('publish.point_in_time.example', { example: '20241014' })}
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
    </Layout>
  );
}
