import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useLocals } from '../../../shared/views/context/Locals';

export function DateField({ name, width = 3, label }: { name: string; width: number; label: ReactNode }) {
  const { errors, values } = useLocals();
  return (
    <div className="govuk-date-input__item">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-date-input__label" htmlFor={name}>
          {label}
        </label>
        <input
          className={clsx(`govuk-input govuk-date-input__input govuk-input--width-${width}`, {
            'govuk-input--error': errors?.find((e) => e.field === name)
          })}
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          defaultValue={values?.[name] ? values[name] : ''}
        />
      </div>
    </div>
  );
}
