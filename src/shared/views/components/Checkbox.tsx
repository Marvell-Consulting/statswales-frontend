import React, { ReactNode } from 'react';

import { CheckboxGroup } from './CheckboxGroup';

export type CheckboxOptions = {
  label: ReactNode;
  value: string;
  children?: CheckboxOptions[];
  independentExpand?: boolean;
};

export type CheckboxProps = CheckboxOptions & {
  name: string;
  checked?: boolean;
  values: string[];
  omitName?: boolean;
  renderControls?: () => ReactNode;
};

export const Checkbox = ({
  name,
  label,
  value,
  children,
  checked,
  values,
  independentExpand,
  omitName,
  renderControls
}: CheckboxProps) => {
  const formattedId = name.replaceAll(/\s+/g, '_');
  const CheckboxField = (
    <div className="govuk-checkboxes__item">
      <input
        className="govuk-checkboxes__input"
        id={formattedId}
        name={omitName ? undefined : `${name}`}
        type="checkbox"
        value={value}
        data-aria-controls={children ? `conditional-${name}` : undefined}
        defaultChecked={checked}
      />
      <label className="govuk-label govuk-checkboxes__label" htmlFor={formattedId}>
        {label}
        {!!children?.length && <span className="govuk-visually-hidden"> has nested options</span>}
      </label>
    </div>
  );

  if (independentExpand && !!children?.length) {
    return (
      <details open>
        <summary>{CheckboxField}</summary>
        <div className="indent">
          {renderControls?.()}
          <CheckboxGroup
            options={children}
            name={name}
            values={values}
            independentExpand={independentExpand}
            renderControls={renderControls}
          />
        </div>
      </details>
    );
  }

  return (
    <>
      {CheckboxField}
      {children && (
        <div className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden" id={`conditional-${name}`}>
          <CheckboxGroup
            options={children}
            name={name}
            values={values}
            independentExpand={independentExpand}
            renderControls={renderControls}
          />
        </div>
      )}
    </>
  );
};
