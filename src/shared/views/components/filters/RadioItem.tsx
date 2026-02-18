import React from 'react';

export type RadioOption = {
  label: string;
  value: string;
  children?: RadioOption[];
};

export type RadioItemProps = RadioOption & {
  name: string;
  checked?: boolean;
  selectedValue?: string;
};

// Forward declaration — FilterRadioGroup is imported lazily to avoid circular deps
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const RadioItem = ({ name, label, value, children, checked, selectedValue }: RadioItemProps) => {
  const formattedId = `${name}.${value}`.replaceAll(/\s+/g, '_');

  // Inline require to break circular dependency between RadioItem ↔ FilterRadioGroup
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FilterRadioGroup } = require('./FilterRadioGroup');

  return (
    <>
      <div className="govuk-radios__item">
        <input
          className="govuk-radios__input"
          id={formattedId}
          name={name}
          type="radio"
          value={value}
          defaultChecked={checked}
        />
        <label className="govuk-label govuk-radios__label" htmlFor={formattedId}>
          {label}
        </label>
      </div>
      {children && (
        <div className="govuk-radios__conditional" id={`conditional-${formattedId}`}>
          <FilterRadioGroup options={children} name={`${name}.${value}`} selectedValue={selectedValue} />
        </div>
      )}
    </>
  );
};
