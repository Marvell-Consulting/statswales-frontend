import React from 'react';

import Layout from './components/Layout';
import SearchResults from './components/SearchResults';
import T from '../../shared/views/components/T';

function NoResults() {
  return (
    <div>
      <p className="govuk-body">
        <strong>
          <T>consumer.search.no_results.try_1</T>
        </strong>
      </p>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <T>consumer.search.no_results.try_2</T>
        </li>
        <li>
          <T>consumer.search.no_results.try_3</T>
        </li>
      </ul>
    </div>
  );
}

function ResultCount({ count, total }) {
  const truncatedResults = total > count;

  return (
    <p className="govuk-heading-m search-result-count">
      {truncatedResults ? (
        <T total={total} count={count} raw={true}>
          consumer.search.result_count_truncated
        </T>
      ) : (
        <T total={total} raw={true}>
          consumer.search.result_count
        </T>
      )}
    </p>
  );
}

export default function Search(props) {
  const title = props.t('consumer.search.heading');
  const { keywords } = props;

  return (
    <Layout {...props} noPad={true} title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-label-wrapper govuk-!-margin-top-6">
            <label className="govuk-label govuk-heading-l govuk-!-margin-bottom-3" htmlFor="search-input">
              {title}
            </label>
          </h1>

          <form method="get" className="govuk-!-margin-bottom-6 search-form">
            <input className="govuk-input" id="search-input" name="keywords" type="search" defaultValue={keywords} />
            <input type="hidden" name="feature" value="search" />
            <button type="submit" className="govuk-button govuk-button-small" data-module="govuk-button">
              {props.t('consumer.search.button')}
            </button>
          </form>

          {props.results && <ResultCount count={props.results.length || 0} total={props.count || 0} />}
          {props.results?.length > 0 && <SearchResults results={props.results} />}
          {props.results?.length === 0 && <NoResults />}
        </div>
      </div>
    </Layout>
  );
}
