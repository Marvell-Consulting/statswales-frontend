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
      {options.map((option, index) => (
        <RadioItem
          key={index}
          name={name}
          checked={selectedValue === option.value}
          {...option}
          selectedValue={selectedValue}
        />
      ))}
    </div>
  );
};
