import React, { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  name: string;
  options: Option[];
  className?: string;
  label?: ReactNode;
  labelClassName?: string;
  labelStyle?: CSSProperties;
  hint?: ReactNode;
  inline?: boolean;
  value?: string;
};

export default function Select({
  label,
  className,
  labelStyle,
  name,
  hint,
  options,
  inline,
  value,
  labelClassName
}: SelectProps) {
  return (
    <div className={clsx('govuk-form-group', { 'govuk-form-group--inline': inline }, className)}>
      {label && (
        <label
          className={clsx('govuk-label', labelClassName)}
          htmlFor={name}
          style={labelStyle || (inline ? { display: 'inline-block' } : undefined)}
        >
          {label}
          {inline ? ':' : null}
        </label>
      )}

      {hint && (
        <div className="govuk-hint" id={`${name}-hint`}>
          {hint}
        </div>
      )}

      {inline ? ' ' : null}
      <select className="govuk-select" id={name} name={name} aria-describedby={hint ? `${name}-hint` : undefined}>
        {options.map((opt, index) => (
          <option
            key={index}
            value={typeof opt === 'object' ? opt.value : opt}
            selected={typeof opt === 'object' ? opt.value === value : opt === value}
            disabled={typeof opt === 'object' && opt.disabled}
          >
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
