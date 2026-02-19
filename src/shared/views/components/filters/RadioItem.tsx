import React, { ReactNode } from 'react';

export type RadioOption = {
  label: string;
  value: string;
  children?: RadioOption[];
};

export type RadioItemProps = {
  name: string;
  label: string;
  value: string;
  checked?: boolean;
  children?: ReactNode;
};

export const RadioItem = ({ name, label, value, checked, children }: RadioItemProps) => {
  const formattedId = `${name}.${value}`.replaceAll(/\s+/g, '_');

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
          {children}
        </div>
      )}
    </>
  );
};
