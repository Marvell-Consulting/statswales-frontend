import React from 'react';

import Layout from './components/Layout';
import DatasetList from './components/DatasetList';
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

function ResultCount(props) {
  return (
    <p className="govuk-body-l govuk-!-margin-bottom-6">
      <strong>{props.count}</strong> <T>consumer.search.result_count</T>
    </p>
  );
}

export default function Search(props) {
  const title = props.t('consumer.search.heading');
  const { mode, keywords } = props;

  return (
    <Layout {...props} noPad={true} title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l govuk-!-margin-top-6" htmlFor="search-input">
            {title}
          </h1>

          <form method="get" className="govuk-!-margin-bottom-6 search-form">
            <select className="govuk-select govuk-!-margin-right-0" id="search-mode" name="mode" defaultValue={mode}>
              <option value="basic">{props.t('consumer.search.mode.basic')}</option>
              <option value="fts">{props.t('consumer.search.mode.fts')}</option>
            </select>
            <input className="govuk-input" id="search-input" name="keywords" type="search" defaultValue={keywords} />
            <button type="submit" className="govuk-button govuk-button-small" data-module="govuk-button">
              {props.t('consumer.search.button')}
            </button>
          </form>

          {props.results && <ResultCount count={props.count || 0} />}
          {props.results?.length > 0 && <DatasetList datasets={props.results} />}
          {props.results?.length === 0 && <NoResults />}
        </div>
      </div>
    </Layout>
  );
}
