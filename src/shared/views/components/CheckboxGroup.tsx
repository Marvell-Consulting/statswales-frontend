import React, { ReactNode } from 'react';

import { Checkbox, CheckboxOptions } from './Checkbox';

export type CheckboxGroupProps = {
  options: CheckboxOptions[];
  name: string;
  values?: string[];
  independentExpand?: boolean;
  controls?: ReactNode;
};

export const CheckboxGroup = ({ options, name, values = [], independentExpand, controls }: CheckboxGroupProps) => {
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
            controls={controls}
          />
        );
      })}
    </div>
  );
};
