import React, { ReactNode } from 'react';

import { Checkbox, CheckboxOptions } from './Checkbox';

export type CheckboxGroupProps = {
  options: CheckboxOptions[];
  name: string;
  values?: string[];
  independentExpand?: boolean;
  renderControls?: () => ReactNode;
};

export const CheckboxGroup = ({
  options,
  name,
  values = [],
  independentExpand,
  renderControls
}: CheckboxGroupProps) => {
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
            renderControls={renderControls}
          />
        );
      })}
    </div>
  );
};
