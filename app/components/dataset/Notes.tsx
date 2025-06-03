import type { PreviewMetadata } from '~/interfaces/preview-metadata';
import T from '../T';
import { dateFormat } from '~/utils/date-format';

export default function Notes({ notes }: { notes: PreviewMetadata['notes'] }) {
  if (!notes.publishedRevisions?.length && !notes.roundingApplied) {
    return null;
  }

  return (
    <div className="dataset-notes">
      <h2 className="govuk-heading-m govuk-!-margin-top-6">
        <T>dataset_view.notes.heading</T>
      </h2>

      <dl className="govuk-summary-list">
        {(notes.publishedRevisions?.length || 0) > 1 && (
          <div id="revisions" className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              <T>dataset_view.notes.revisions</T>
            </dt>
            <dd className="govuk-summary-list__value">
              <ul className="govuk-list">
                {notes.publishedRevisions!.map((revision, index) => (
                  <li key={index}>
                    {/* FIXME: why can this be a boolean */}
                    <strong>
                      {dateFormat(revision.publish_at as unknown as string, 'd MMMM yyyy')}
                    </strong>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {notes.roundingApplied && (
          <div id="data-rounding" className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              <T>dataset_view.notes.rounding</T>
            </dt>
            <dd
              className="govuk-summary-list__value"
              // FIXME: we should sanitise this
              dangerouslySetInnerHTML={{ __html: notes.roundingDescription }}
            />
          </div>
        )}
      </dl>
    </div>
  );
}
