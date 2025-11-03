import React from 'react';
import Layout from './components/Layout';
import Pagination from '../../shared/views/components/Pagination';
import { dateFormat } from '../../shared/utils/date-format';

export default function ConsumerList(props) {
  const title = props.t('consumer.list.heading');
  return (
    <Layout {...props} title={title}>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">{title}</h1>
        </div>
      </div>

      <div className="govuk-grid-row govuk-!-margin-bottom-5">
        <div className="govuk-grid-column-two-thirds">
          <p>
            <span className="govuk-!-font-size-36 govuk-!-font-weight-bold">{props.count}</span>
            <span className="govuk-!-font-size-24"> {props.t('consumer.list.total_datasets')}</span>
          </p>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--2 govuk-section-break--visible" />
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <ul className="govuk-list">
            {props.data.map((dataset, index) => (
              <li key={index} className="index-list__item">
                <a href={props.buildUrl(`/${dataset.id}`, props.i18n.language)}>
                  <h3 className="govuk-heading-xs govuk-!-margin-bottom-0">{dataset.title}</h3>
                </a>
                <div className="index-list__meta">
                  <p>
                    <span className="govuk-body-s caption index-list__item__meta">
                      {dateFormat(dataset.first_published_at, 'd MMMM yyyy', { locale: props.i18n.language })}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {props.total_pages > 1 && <Pagination {...props} />}
    </Layout>
  );
}
