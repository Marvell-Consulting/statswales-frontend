import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';
import clsx from 'clsx';
import { ViewError } from '../../../shared/dtos/view-error';
import { SatisfactionOptions } from '../../../shared/enums/satisfaction-options';
import FlashMessages from '../../../shared/views/components/FlashMessages';

type FeedbackFormProps = {
  values: Record<string, any>;
  errors: ViewError[];
};

export default function FeedbackForm(props: FeedbackFormProps) {
  const { buildUrl, i18n } = useLocals();

  const satisfactionOptions = Object.values(SatisfactionOptions).map((value) => ({
    value,
    label: i18n.t(`feedback.form.satisfaction.options.${value}.label`)
  }));

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <FlashMessages />
        <h1 className="govuk-heading-xl">
          <T>feedback.heading</T>
        </h1>

        <form method="POST" action={buildUrl('/feedback', i18n.language)} className="govuk-form-group">
          <RadioGroup
            name="satisfaction"
            label={i18n.t('feedback.form.satisfaction.label')}
            options={satisfactionOptions}
            value={props.values.satisfaction}
            errorMessage={i18n.t('feedback.form.satisfaction.error')}
          />

          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h2 className="govuk-fieldset__heading govuk-heading-m">
                <T>feedback.form.improve.label</T>
              </h2>
            </legend>
            <p className="govuk-hint">
              <T>feedback.form.improve.hint</T>
            </p>
            {props.errors?.find((e) => e.field === 'improve') && (
              <p id="improve-error" className="govuk-error-message">
                {i18n.t('feedback.form.improve.error')}
              </p>
            )}
            <textarea
              className={clsx('govuk-textarea', {
                'govuk-textarea--error': props.errors?.find((e: ViewError) => e.field === 'improve')
              })}
              id="improve"
              name="improve"
              rows={10}
              defaultValue={props.values.improve}
            />
          </fieldset>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button">
              <T>feedback.form.buttons.submit</T>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
