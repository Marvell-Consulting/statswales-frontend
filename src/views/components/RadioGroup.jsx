import React, { Fragment } from 'react';
import clsx from 'clsx';

export default function RadioGroup({ name, label, hint, options, value, labelledBy, errors, errorMessage }) {
  return (
    <div className={clsx('govuk-form-group', { 'govuk-form-group--error': errors?.find((e) => e.field === name) })}>
      <fieldset className="govuk-fieldset" aria-labelledby={labelledBy}>
        {label && (
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
            <h2 className="govuk-fieldset__heading govuk-heading-m">{label}</h2>
          </legend>
        )}

        {hint && <p className="govuk-hint">{hint}</p>}

        {errorMessage && errors?.find((e) => e.field === name) && (
          <p id={`${name}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errorMessage}
          </p>
        )}

        <div className="govuk-radios" data-module="govuk-radios">
          {options.map((option, index) =>
            option.divider ? (
              <div key={index} className="govuk-radios__divider">
                {option.divider}
              </div>
            ) : (
              <Fragment key={index}>
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id={option.value}
                    name={name}
                    type="radio"
                    value={option.value}
                    disabled={option.disabled}
                    defaultChecked={option.value === value}
                    data-aria-controls={option.children && `conditional-${option.id}`}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor={option.value}>
                    {option.label}
                  </label>
                  {option.hint && (
                    <div id={`${option.value}-hint`} className="govuk-hint govuk-radios__hint govuk-radios__hint-gel">
                      {option.hint}
                    </div>
                  )}
                </div>
                {option.children && (
                  <div
                    className="govuk-radios__conditional govuk-radios__conditional--hidden"
                    id={`conditional-${option.id}`}
                  >
                    {option.children}
                  </div>
                )}
              </Fragment>
            )
          )}
        </div>
      </fieldset>
    </div>
  );
}
