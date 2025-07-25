import React from 'react';
import { useLocals } from '../../../shared/views/context/Locals';
import T from '../../../shared/views/components/T';

export default function ErrorHandler() {
  const { errors } = useLocals();
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <div className="govuk-error-summary" data-module="govuk-error-summary">
      <div role="alert">
        <h2 className="govuk-error-summary__title">
          <T>errors.problem</T>
        </h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map((error) => (
              <li key={error.message.key}>
                <a href={`#${error.field}`}>
                  <T {...error.message.params}>{error.message.key}</T>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
