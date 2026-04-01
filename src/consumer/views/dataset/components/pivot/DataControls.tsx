import React from 'react';
import { useLocals } from '../../../../../shared/views/context/Locals';
import T from '../../../../../shared/views/components/T';

type DataControlsProps = {
  dataset: {
    id: string;
  };
  filterId: string;
};

export function DataControls(props: DataControlsProps) {
  const { buildUrl, i18n } = useLocals();
  const startOverURL = buildUrl(`/${props.dataset.id}/pivot#dataset-nav`, i18n.language);

  return (
    <div className="pivot-controls">
      <a href={startOverURL} id="start-over-btn" className="govuk-button govuk-button--tertiary govuk-button-small">
        <T>pivot.create_own</T>
      </a>
    </div>
  );
}
