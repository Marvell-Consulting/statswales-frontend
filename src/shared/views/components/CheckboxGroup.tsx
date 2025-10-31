import { clsx } from 'clsx';
import React, { ReactNode } from 'react';
import T from './T';

export type CheckboxOptions = {
  label: ReactNode;
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

export function Controls({
  className,
  selectAllLabel,
  noneLabel
}: {
  className?: string;
  selectAllLabel: ReactNode;
  noneLabel: ReactNode;
}) {
  return (
    <div className={clsx('controls non-js-hidden', className)}>
      <a href="#" className="govuk-link nowrap" data-action="select-all">
        {selectAllLabel}
      </a>
      <span>|</span>
      <a href="#" className="govuk-link nowrap" data-action="clear">
        {noneLabel}
      </a>
    </div>
  );
}

export const Checkbox = ({
  name,
  label,
  value,
  children,
  checked,
  values,
  independentExpand,
  omitName
}: CheckboxOptions & {
  name: string;
  checked?: boolean;
  values: string[];
  omitName?: boolean;
}) => {
  const formattedId = name.replaceAll(/\s+/g, '_');
  const CheckboxField = (
    <div className="govuk-checkboxes__item">
      <input
        className="govuk-checkboxes__input checkboxes__input__filter"
        id={formattedId}
        name={omitName ? undefined : `${name}`}
        type="checkbox"
        value={value}
        data-aria-controls={children ? `conditional-${name}` : undefined}
        defaultChecked={checked}
      />
      <label className="govuk-label govuk-checkboxes__label checkboxes__label__filter" htmlFor={formattedId}>
        {label}
        {!!children?.length && <span className="govuk-visually-hidden"> has child filters</span>}
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
          <Controls
            selectAllLabel={
              <T columnName={label} raw>
                filters.select_all
              </T>
            }
            noneLabel={
              <T columnName={label} raw>
                filters.none
              </T>
            }
          />
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
            name={`${name}.${option.value}[]`}
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
