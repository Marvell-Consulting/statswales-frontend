import React from 'react';
import Select, { SelectProps } from './Select';

export type AutocompleteProps = SelectProps & {
  autoSelect?: boolean;
  showAllValues?: boolean;
  defaultValue?: string;
};

export default function Autocomplete({
  autoSelect = true,
  showAllValues = true,
  defaultValue,
  ...props
}: AutocompleteProps) {
  return (
    <div className="govuk-form-group">
      <Select {...props} />
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              accessibleAutocomplete.enhanceSelectElement({
                selectElement: document.querySelector('#${props.name}'),
                autoSelect: ${autoSelect ? true : false},
                showAllValues: ${showAllValues ? true : false},
                defaultValue: ${defaultValue ? defaultValue : '""'}
              });
            })()`
        }}
      ></script>
    </div>
  );
}
