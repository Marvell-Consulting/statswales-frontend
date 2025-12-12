import React from 'react';
import { clsx } from 'clsx';

import { useLocals } from '../../../shared/views/context/Locals';
import { statusToColour } from '../../../shared/utils/status-to-colour';
import { dateFormat } from '../../../shared/utils/date-format';
import { DatasetStatus } from '../../../shared/enums/dataset-status';
import T from '../../../shared/views/components/T';
import { DatasetListItemDTO } from '../../../shared/dtos/dataset-list-item';

interface DatasetsProps {
  datasets: DatasetListItemDTO[];
}

export default function Datasets({ datasets }: DatasetsProps) {
  const { buildUrl, i18n } = useLocals();

  return (
    <ul className="govuk-list">
      {datasets.map((dataset) => (
        <li className="index-list__item" key={dataset.id}>
          <a
            className="govuk-heading-s govuk-!-margin-bottom-0 govuk-link inline"
            href={buildUrl(`/${dataset.id}`, i18n.language)}
          >
            {dataset.title}
          </a>
          <div className="index-list__meta">
            <p className="govuk-!-margin-top-0">
              {dataset.archived_at && (
                <strong
                  className={clsx(
                    'govuk-tag',
                    'dataset-status ',
                    `govuk-tag--${statusToColour(DatasetStatus.Archived)}`,
                    'govuk-!-margin-right-2'
                  )}
                >
                  <T>consumer.topic_list.status.archived</T>
                </strong>
              )}
              {dataset.first_published_at && (
                <span className="govuk-body-s caption index-list__item__meta">
                  <T published={dateFormat(dataset.first_published_at, 'd MMMM yyyy', { locale: i18n.language })}>
                    consumer.topic_list.dataset.first_published
                  </T>
                </span>
              )}

              {dataset.last_updated_at && dataset.last_updated_at !== dataset.first_published_at && (
                <span className="govuk-body-s caption index-list__item__meta">
                  <T updated={dateFormat(dataset.last_updated_at, 'd MMMM yyyy', { locale: i18n.language })}>
                    consumer.topic_list.dataset.last_updated
                  </T>
                </span>
              )}
              {dataset.archived_at && (
                <span className="govuk-body-s caption index-list__item__meta">
                  <T archived={dateFormat(dataset.archived_at, 'd MMMM yyyy', { locale: i18n.language })}>
                    consumer.topic_list.dataset.archived
                  </T>
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
