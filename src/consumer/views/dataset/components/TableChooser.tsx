import React from 'react';
import T from '../../../../shared/views/components/T';

export default function TableChooser() {
  return (
    <form method="POST">
      <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h2 className="govuk-heading-m">
                <T>table_chooser.heading</T>
              </h2>
            </legend>
            <div className="govuk-radios" data-module="govuk-radios">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="tableChoicePivot"
                  name="chooser"
                  type="radio"
                  value="pivot"
                  required={true}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="tableChoicePivot">
                  <T>table_chooser.pivot.label</T>
                </label>
                <div className="govuk-hint govuk-radios__hint">
                  <T>table_chooser.pivot.hint</T>
                </div>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="tableChoiceData"
                  name="chooser"
                  type="radio"
                  value="data"
                  required={true}
                />
                <label className="govuk-label govuk-radios__label" htmlFor="tableChoiceData">
                  <T>table_chooser.data.label</T>
                </label>
                <div className="govuk-hint govuk-radios__hint">
                  <T>table_chooser.data.hint</T>
                </div>
              </div>
            </div>
          </fieldset>
          <div className="govuk-!-padding-top-5 govuk-!-margin-bottom-2">
            <button type="submit" className="govuk-button" data-module="govuk-button">
              <T>buttons.continue</T>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
