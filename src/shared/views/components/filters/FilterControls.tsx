import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

export type FilterControlsProps = {
  className?: string;
  deselectLabel: ReactNode;
  selectLabel: ReactNode;
};

export const FilterControls = ({ className, deselectLabel, selectLabel }: FilterControlsProps) => {
  return (
    <div className={clsx('filter-controls js-hidden', className)}>
      <a href="#" className="govuk-link nowrap" data-action="toggle">
        <span className="toggle-deselect">{deselectLabel}</span>
        <span className="toggle-select js-hidden">{selectLabel}</span>
      </a>
    </div>
  );
};
