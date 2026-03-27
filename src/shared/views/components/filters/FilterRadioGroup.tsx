import React from 'react';

import { RadioItem, RadioOption } from './RadioItem';

export type FilterRadioGroupProps = {
  options: RadioOption[];
  name: string;
  selectedValue?: string;
};

export const FilterRadioGroup = ({ options, name, selectedValue }: FilterRadioGroupProps) => {
  const hasGroups = options.some((opt) => opt.children?.length);
  return (
    <div className={`govuk-radios govuk-radios--small${hasGroups ? ' has-groups' : ''}`}>
      {options.map((option, index) => {
        return (
          <RadioItem
            key={index}
            name={name}
            label={option.label}
            value={option.value}
            checked={selectedValue === option.value}
          >
            {option.children?.length ? (
              <FilterRadioGroup options={option.children} name={name} selectedValue={selectedValue} />
            ) : undefined}
          </RadioItem>
        );
      })}
    </div>
  );
};
