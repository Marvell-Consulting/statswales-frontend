import type { PreviewMetadata } from '~/interfaces/preview-metadata';
import T from '../T';

export default function About({ about }: { about: PreviewMetadata['about'] }) {
  return (
    <div className="dataset-about">
      <h2 className="govuk-heading-m">
        <T>dataset_view.about.overview</T>
      </h2>

      <dl className="govuk-summary-list">
        <div id="summary" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.about.summary</T>
          </dt>
          <dd
            className="govuk-summary-list__value"
            // FIXME: we should sanitize this
            dangerouslySetInnerHTML={{
              __html: about.summary || <T>dataset_view.not_entered</T>
            }}
          />
        </div>

        <div id="data-collection" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.about.data_collection</T>
          </dt>
          <dd
            className="govuk-summary-list__value"
            // FIXME: we should sanitize this
            dangerouslySetInnerHTML={{
              __html: about.collection || <T>dataset_view.not_entered</T>
            }}
          />
        </div>

        <div id="data-quality" className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.about.statistical_quality</T>
          </dt>
          <dd
            className="govuk-summary-list__value"
            dangerouslySetInnerHTML={{
              __html: about.quality || <T>dataset_view.not_entered</T>
            }}
          />
        </div>

        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">
            <T>dataset_view.about.related_reports</T>
          </dt>
          <dd className="govuk-summary-list__value">
            {(about.relatedLinks?.length || 0) > 0 ? (
              <ul className="govuk-list">
                {about.relatedLinks!.map((link, index) => (
                  <li key={index}>
                    <a
                      className="govuk-link govuk-link--no-underline"
                      href={link.url}
                      target="_blank"
                    >
                      {/* FIXME: label doesn't exist on this type, we should augment it */}
                      {(link as any).label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <T>dataset_view.not_entered</T>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
