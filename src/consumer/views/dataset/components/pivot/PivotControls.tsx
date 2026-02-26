import React from 'react';
import { useLocals } from '../../../../../shared/views/context/Locals';
import T from '../../../../../shared/views/components/T';

type PivotControlsProps = {
  dataset: {
    id: string;
  };
  filterId: string;
};

export function PivotControls(props: PivotControlsProps) {
  const { buildUrl, i18n } = useLocals();
  const startOverURL = buildUrl(`/${props.dataset.id}/start`, i18n.language);
  const dataURL = buildUrl(`/${props.dataset.id}/filtered/${props.filterId}`, i18n.language);

  return (
    <div className="pivot-controls">
      <a href={startOverURL} className="govuk-button govuk-button--tertiary govuk-button-small">
        <T>pivot.start_over</T>
      </a>
      <span>&nbsp;</span>
      <a href={dataURL} className="govuk-button govuk-button--tertiary govuk-button-small">
        <T>pivot.show_data</T>
      </a>
    </div>
  );
}
