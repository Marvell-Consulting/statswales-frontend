import React from 'react';

import Layout from './components/Layout';
import DatasetList from './components/DatasetList';

export default function Search(props) {
  const title = props.t('consumer.search.heading');

  return (
    <Layout {...props} noPad={true} title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-top-6">{title}</h1>

          <form method="get" className="govuk-!-margin-bottom-6">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="search-input">
                {props.t('consumer.search.label')}
              </label>
              <div className="govuk-input__wrapper">
                <input
                  className="govuk-input"
                  id="search-input"
                  name="q"
                  type="search"
                  defaultValue={props.searchTerm || ''}
                />
              </div>
            </div>
            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('consumer.search.button')}
            </button>
          </form>

          {props.searchTerm && props.searchResults && <DatasetList datasets={props.searchResults} />}
        </div>
      </div>
    </Layout>
  );
}
