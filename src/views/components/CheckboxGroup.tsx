import React from 'react';

export type CheckboxOptions = {
  label: string;
  value: string;
  children?: CheckboxOptions[];
  independentExpand?: boolean;
};

export type CheckboxGroupProps = {
  options: CheckboxOptions[];
  name: string;
  values?: string[];
  independentExpand?: boolean;
};

export const Checkbox = ({
  name,
  label,
  value,
  children,
  checked,
  values,
  independentExpand
}: CheckboxOptions & { name: string; checked?: boolean; values: string[] }) => {
  const CheckboxField = (
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
  );

  function hasValue(item: CheckboxOptions, values: string[]): boolean {
    if (values.includes(item.value)) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => hasValue(child, values));
    }

    return false;
  }

  if (independentExpand && !!children?.length) {
    const isOpen = children.some((child) => hasValue(child, values));
    return (
      <details open={isOpen}>
        <summary>{CheckboxField}</summary>
        <div className="indent">
          <CheckboxGroup options={children} name={name} values={values} independentExpand={independentExpand} />
        </div>
      </details>
    );
  }

  return (
    <>
      {CheckboxField}
      {children && (
        <div className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden" id={`conditional-${name}`}>
          <CheckboxGroup options={children} name={name} values={values} independentExpand={independentExpand} />
        </div>
      )}
    </>
  );
};

export const CheckboxGroup = ({ options, name, values = [], independentExpand }: CheckboxGroupProps) => {
  return (
    <div
      className="govuk-checkboxes govuk-checkboxes--small"
      data-module={independentExpand ? undefined : 'govuk-checkboxes'}
    >
      {options.map((option, index) => {
        return (
          <Checkbox
            key={index}
            name={`${name}.${option.value}`}
            checked={values.includes(option.value)}
            {...option}
            values={values}
            independentExpand={independentExpand}
          />
        );
      })}
    </div>
  );
};
