import React from 'react';
import { dateFormat } from '../../../../shared/utils/date-format';
import { NextUpdate, NextUpdateProps } from '../../../../shared/views/components/dataset/NextUpdate';
import { useLocals } from '../../../../shared/views/context/Locals';
import { RevisionDTO } from '../../../../shared/dtos/revision';

export type HistoryTabProps = NextUpdateProps & {
  publicationHistory: (RevisionDTO & { metadata?: { reason: string } })[];
};

export default function HistoryTab(props: HistoryTabProps) {
  const { i18n } = useLocals();
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <NextUpdate {...props} />

        {props.publicationHistory?.length > 0 && (
          <>
            <h2>{i18n.t('consumer_view.history.updates')}</h2>
            <dl className="publication-history govuk-summary-list">
              {props.publicationHistory.map((revision) => (
                <div key={revision.id} className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    {revision.publish_at && dateFormat(revision.publish_at, 'do MMMM yyyy', { locale: i18n.language })}
                  </dt>
                  <dd
                    className="govuk-summary-list__value"
                    dangerouslySetInnerHTML={{
                      __html:
                        revision.revision_index === 1
                          ? i18n.t('consumer_view.history.initial_publication')
                          : revision.metadata?.reason
                    }}
                  ></dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
