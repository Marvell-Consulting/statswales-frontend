import React from 'react';

export type CheckboxOptions = {
  label: string;
  value: string;
  children?: CheckboxOptions[];
};

type CheckboxGroupProps = {
  options: CheckboxOptions[];
  name: string;
  values?: string[];
};

export const Checkbox = ({
  name,
  label,
  value,
  children,
  checked,
  values
}: CheckboxOptions & { name: string; checked?: boolean; values: string[] }) => {
  return (
    <>
      <div className="govuk-checkboxes__item">
        <input
          className="govuk-checkboxes__input checkboxes__input__filter"
          id={name}
          name={`${name}[]`}
          type="checkbox"
          value={value}
          data-aria-controls={children ? `conditional-${name}` : undefined}
          defaultChecked={checked}
        />
        <label className="govuk-label govuk-checkboxes__label checkboxes__label__filter" htmlFor={name}>
          {label}
        </label>
      </div>
      {children && (
        <div className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden" id={`conditional-${name}`}>
          <CheckboxGroup options={children} name={name} values={values} />
        </div>
      )}
    </>
  );
};

export const CheckboxGroup = ({ options, name, values = [] }: CheckboxGroupProps) => {
  return (
    <div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
      {options.map((option, index) => {
        return (
          <Checkbox
            key={index}
            name={`${name}.${option.value}`}
            checked={values.includes(option.value)}
            {...option}
            values={values}
          />
        );
      })}
    </div>
  );
};
