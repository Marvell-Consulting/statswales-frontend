import React from 'react';
import T from '../../../shared/views/components/T';

export type NonMatchingValueProps = {
  value: unknown;
};

// Renders an uploaded, non-matching cell value inside a quoted string, visually
// marking spaces so editors can spot leading/trailing/duplicate whitespace.
// The value comes straight from the publisher-uploaded CSV/lookup table, so it
// must only ever be rendered as text (React's default escaping) — never fed to
// dangerouslySetInnerHTML.
export default function NonMatchingValue({ value }: NonMatchingValueProps) {
  const text = value === null || value === undefined ? '' : value.toString();
  const parts = text.split(' ');

  return (
    <>
      &quot;
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <>
              <T className="govuk-visually-hidden">publish.non_matching_value.space</T>
              <span aria-hidden="true" className="mid-dot">
                &middot;
              </span>
            </>
          )}
        </React.Fragment>
      ))}
      &quot;
    </>
  );
}
