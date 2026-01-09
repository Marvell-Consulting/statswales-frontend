import React from 'react';

export type NoteCodesLegendProps = {
  note_codes: string[];
  shorthandUrl: string;
  t: (key: string, options?: Record<string, string>) => string;
};

export default function NoteCodesLegend(props: NoteCodesLegendProps) {
  if (!props.note_codes || props.note_codes.length === 0) return null;

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <p className="govuk-body standard-shorthand">
          <span
            dangerouslySetInnerHTML={{
              __html: props.t('dataset_view.notes.shorthand', { shorthand_url: props.shorthandUrl })
            }}
          ></span>
          {props.note_codes.map((code: React.Key | null | undefined, idx: number) => (
            <span key={code} className="govuk-body">
              {` [${code}] = ${props.t(`dataset_view.notes.${code}`).toLowerCase()}${idx < props.note_codes.length - 1 ? ',' : '.'}`}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
