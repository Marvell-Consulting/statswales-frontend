import type { PreviewMetadata } from '~/interfaces/preview-metadata';
import T from '../T';

export default function Published({ published }: { published: PreviewMetadata['published'] }) {
  return (
    <div className="dataset-published">
      <h2 className="govuk-heading-m govuk-!-margin-top-6">
        <T>dataset_view.published.heading</T>
      </h2>

      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.published.org</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {published.organisation?.name || <T>dataset_view.not_entered</T>}
          </dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.published.contact</T>
          </dt>
          <dd className="govuk-summary-list__value"></dd>
        </div>
      </dl>
    </div>
  );
}
