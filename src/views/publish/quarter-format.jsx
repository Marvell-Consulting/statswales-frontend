import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function QuarterFormat(props) {
  const backLink = props.quarterTotals
    ? props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/period/months`, props.i18n.language)
    : props.buildUrl(`/publish/${props.datasetId}/dates/${props.dimension.id}/period/type`, props.i18n.language);
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);

  function RadioItem({ label, value, example, index }) {
    return (
      <div className="govuk-radios__item">
        <input
          className="govuk-radios__input"
          id={`quarter-format-${index}`}
          name="quarterType"
          type="radio"
          defaultChecked={props.quarterType === value}
          value={value}
        />
        <label className="govuk-label govuk-radios__label" htmlFor={`quarter-format-${index}`}>
          {label}
        </label>
        <div id={`quarter-format-${index}-hint`} className="govuk-hint govuk-radios__hint">
          {props.t('publish.quarter_format.example', { example })}
        </div>
      </div>
    );
  }

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <span className="region-subhead">{props.dimension.metadata.name}</span>
      {props.quarterTotals ? (
        <h1 className="govuk-heading-xl">{props.t('publish.quarter_format.heading-alt')}</h1>
      ) : (
        <h1 className="govuk-heading-xl">{props.t('publish.quarter_format.heading')}</h1>
      )}

      <ErrorHandler {...props} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <form method="post" role="continue">
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <div className="govuk-radios" data-module="govuk-radios">
                  <RadioItem label="Qx" value="QX" example="Q1" index={2} />
                  <RadioItem label="_Qx" value="_QX" example="_Q1" index={3} />
                  <RadioItem label="-Qx" value="-QX" example="-Q1" index={4} />
                  <RadioItem label="x" value="X" example="1" index={5} />
                  <RadioItem label="_x" value="_X" example="_1" index={6} />
                  <RadioItem label="-x" value="-X" example="-1" index={7} />
                </div>
                {props.quarterTotals && (
                  <>
                    <div className="govuk-checkboxes__divider">or</div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="quarter-format-1"
                        name="quarterType"
                        type="radio"
                        value="QX"
                      />
                      <label className="govuk-label govuk-radios__label" htmlFor="quarter-format-1">
                        {props.t('publish.quarter_format.no_quarterly_totals')}
                      </label>
                    </div>
                  </>
                )}
              </fieldset>
            </div>

            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h2 className="govuk-fieldset__heading">{props.t('publish.quarter_format.fifth_quarter')}</h2>
                </legend>
                <p className="govuk-hint">{props.t('publish.quarter_format.fifth_example')}</p>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="fifth-quater-yes"
                      name="fifthQuater"
                      type="radio"
                      defaultChecked={props.fifthQuater === 'yes'}
                      value="yes"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="fifth-quater-yes">
                      {props.t('yes')}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="fifth-quater-no"
                      name="fifthQuater"
                      type="radio"
                      defaultChecked={props.fifthQuater === 'no'}
                      value="no"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="fifth-quater-no">
                      {props.t('no')}
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
    </Layout>
  );
}
