import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

export type FilterControlsProps = {
  className?: string;
  selectAllLabel: ReactNode;
  noneLabel: ReactNode;
};

export const FilterControls = ({ className, selectAllLabel, noneLabel }: FilterControlsProps) => {
  return (
    <div className={clsx('controls js-hidden', className)}>
      <a href="#" className="govuk-link nowrap" data-action="select-all">
        {selectAllLabel}
      </a>
      <span>|</span>
      <a href="#" className="govuk-link nowrap" data-action="clear">
        {noneLabel}
      </a>
    </div>
  );
};
