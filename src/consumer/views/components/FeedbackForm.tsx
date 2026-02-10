import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';
import { clsx } from 'clsx';
import { ViewError } from '../../../shared/dtos/view-error';
import { SatisfactionOptions } from '../../../shared/enums/satisfaction-options';
import FlashMessages from '../../../shared/views/components/FlashMessages';

type FeedbackFormProps = {
  values: { satisfaction: string; improve: string; name?: string; email?: string };
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

        <form method="POST" action={buildUrl('/feedback', i18n.language)} className="govuk-form-group" noValidate>
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
              aria-describedby="improve-error"
            />
          </fieldset>

          <fieldset className="govuk-fieldset govuk-!-margin-bottom-9">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              <h2 className="govuk-fieldset__heading govuk-heading-m">
                <T>feedback.form.personal_details.label</T>
              </h2>
            </legend>

            <div className="govuk-form-group">
              <label htmlFor="name" className="govuk-label">
                <T>feedback.form.personal_details.name.label</T>
              </label>
              {props.errors?.find((e: ViewError) => e.field === 'name') && (
                <span className="govuk-error-message" id="name-error">
                  <T>feedback.form.personal_details.name.error</T>
                </span>
              )}
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                className="govuk-input"
                spellCheck="false"
                aria-describedby="name-error"
                defaultValue={props.values.name}
              />
            </div>

            <div className="govuk-form-group">
              <label htmlFor="email" className="govuk-label">
                <T>feedback.form.personal_details.email.label</T>
              </label>

              <div className="govuk-hint" id="email-hint">
                <T>feedback.form.personal_details.email.hint</T>
              </div>
              {props.errors?.find((e: ViewError) => e.field === 'email') && (
                <span className="govuk-error-message" id="email-error">
                  <T>feedback.form.personal_details.email.error</T>
                </span>
              )}
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                className="govuk-input"
                spellCheck="false"
                aria-describedby="email-hint email-error"
                defaultValue={props.values.email}
              />
            </div>
          </fieldset>
          <div className="govuk-button-group">
            <button type="submit" className="govuk-button" data-module="govuk-button" data-prevent-double-click="true">
              <T>feedback.form.buttons.submit</T>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
