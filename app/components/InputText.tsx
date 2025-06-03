import clsx from 'clsx';
import { useErrors } from '~/context/ErrorProvider';

export type InputTextProps = {
  name: string;
  value?: string;
  label?: string;
  labelledBy: string;
};

export const InputText = ({ name, value, labelledBy }: InputTextProps) => {
  const errors = useErrors();
  return (
    <div className="govuk-form-group">
      <input
        className={clsx('govuk-input', {
          'govuk-input--error': errors?.find((e) => e.field === name)
        })}
        id={name}
        name={name}
        type="text"
        value={value}
        aria-labelledby={labelledBy}
      />
    </div>
  );
};
