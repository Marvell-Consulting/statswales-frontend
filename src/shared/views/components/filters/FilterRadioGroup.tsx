import React from 'react';

import { RadioItem, RadioOption } from './RadioItem';

export type FilterRadioGroupProps = {
  options: RadioOption[];
  name: string;
  selectedValue?: string;
};

export const FilterRadioGroup = ({ options, name, selectedValue }: FilterRadioGroupProps) => {
  return (
    <div className="govuk-radios govuk-radios--small">
      {options.map((option, index) => {
        const childName = `${name}.${option.value}`;
        return (
          <RadioItem
            key={index}
            name={name}
            label={option.label}
            value={option.value}
            checked={selectedValue === option.value}
          >
            {option.children?.length ? (
              <FilterRadioGroup options={option.children} name={childName} selectedValue={selectedValue} />
            ) : undefined}
          </RadioItem>
        );
      })}
    </div>
  );
};
