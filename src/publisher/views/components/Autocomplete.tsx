import React from 'react';
import Select, { SelectProps } from '../../../shared/views/components/Select';
import { useLocals } from '../../../shared/views/context/Locals';

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
  const { cspNonce } = useLocals();

  return (
    <div className="govuk-form-group">
      <Select {...props} />
      <script
        type="text/javascript"
        nonce={cspNonce}
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              accessibleAutocomplete.enhanceSelectElement({
                selectElement: document.querySelector('#${props.name}'),
                autoSelect: ${autoSelect ? true : false},
                showAllValues: ${showAllValues ? true : false},
                defaultValue: ${JSON.stringify(defaultValue ?? '')}
              });
            })()`
        }}
      ></script>
    </div>
  );
}
