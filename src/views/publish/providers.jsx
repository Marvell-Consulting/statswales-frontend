import React from 'react';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';
import Table from '../components/Table';
import RadioGroup from '../components/RadioGroup';

export default function Providers(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const columns = [
    'provider',
    {
      key: 'source',
      label: props.t('publish.providers.list.table.source'),
      format: (value) => value || props.t('publish.providers.list.table.no_source')
    },
    {
      key: 'id',
      label: props.t('publish.providers.list.table.action_header'),
      format: (value) => {
        const url = props.buildUrl(`/publish/${props.datasetId}/providers?delete=${value}`, props.i18n.language);
        return (
          <ul className="govuk-summary-list__actions-list">
            <li className="govuk-summary-list__actions-list-item">
              <a href={url} className="govuk-link">
                {props.t('publish.providers.list.table.action_delete')}
              </a>
            </li>
          </ul>
        );
      },
      cellClassNameName: 'nowrap'
    }
  ];
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage>
      <script src="/assets/js/accessible-autocomplete.min.js"></script>

      <div className="govuk-width-container">
        {(props.dataProviders?.length === 0 || props.editId === 'new') && (
          <div className="govuk-grid-row">
            {/* Add provider form is displayed whenever we're adding a "new" provider, or if there aren't any saved currently */}
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl">{props.t('publish.providers.add.heading')}</h1>
              <ErrorHandler {...props} />

              <p
                className="govuk-body"
                dangerouslySetInnerHTML={{
                  __html: props.t('publish.providers.add.explain', {
                    request_data_provider_url: props.request_data_provider_url
                  })
                }}
              />

              <form encType="multipart/form-data" method="post">
                <div className="govuk-form-group">
                  <div className="govuk-hint" id="provider-hint">
                    {props.t('publish.providers.add.form.provider.hint')}
                  </div>
                  <select id="provider" name="provider_id" className="govuk-select" aria-describedby="provider-hint">
                    <option key={0} value="" selected disabled></option>
                    {props.availableProviders.map((provider, index) => (
                      <option key={index + 1} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{
                      __html: `
                              (() => {
                                accessibleAutocomplete.enhanceSelectElement({
                                  selectElement: document.querySelector('#provider'),
                                  autoSelect: true,
                                  showAllValues: true,
                                  defaultValue: ''
                                });
                              })()`
                    }}
                  ></script>
                </div>
                <button type="submit" className="govuk-button" data-module="govuk-button">
                  {props.t('buttons.continue')}
                </button>
              </form>
            </div>
          </div>
        )}

        {props.dataProviders?.length > 0 && !props.editId && (
          <>
            {/* Provider table is displayed whenever we're not adding/editing a provider */}
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <h1 className="govuk-heading-xl">{props.t('publish.providers.list.heading')}</h1>
                <ErrorHandler {...props} />
                <Table
                  {...props}
                  i18nBase="publish.providers.list.table"
                  columns={columns}
                  rows={props.dataProviders.map((p) => ({
                    ...p,
                    provider: p.provider_name,
                    source: p.source_name
                  }))}
                />
              </div>
            </div>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                {/* Add another provider form is displayed whenever we're not editing a provider*/}
                <form encType="multipart/form-data" method="post">
                  <input type="hidden" name="add_another" value="true" />
                  <RadioGroup
                    name="add_provider"
                    label={props.t('publish.providers.list.form.add_another.heading')}
                    options={[
                      {
                        value: 'true',
                        label: props.t('publish.providers.list.form.add_another.options.yes.label')
                      },
                      {
                        value: 'false',
                        label: props.t('publish.providers.list.form.add_another.options.no.label')
                      }
                    ]}
                  />
                  <button type="submit" className="govuk-button" data-module="govuk-button">
                    {props.t('buttons.continue')}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {props.editId && props.editId !== 'new' && (
          <div className="govuk-grid-row">
            {/* Select source form is displayed when we're editing a provider */}
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl" id="add-source">
                {props.t('publish.providers.add_source.heading')}
              </h1>
              <ErrorHandler {...props} />

              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                {props.t('publish.providers.add_source.selected_provider')}
              </h3>
              <p className="govuk-body">{props.dataProvider.provider_name}</p>

              <form encType="multipart/form-data" method="post">
                <input type="hidden" name="provider_id" value={props.dataProvider?.provider_id} />

                <RadioGroup
                  name="add_source"
                  labelledBy="add-source"
                  options={[
                    {
                      value: 'true',
                      label: props.t('publish.providers.add_source.form.has_source.options.yes.label'),
                      children: (
                        <div className="govuk-form-group">
                          <fieldset className="govuk-fieldset" role="group" aria-describedby="addYes">
                            <legend
                              className="govuk-fieldset__legend govuk-fieldset__legend--s"
                              dangerouslySetInnerHTML={{
                                __html: props.t('publish.providers.add_source.form.source.note', {
                                  request_data_source_url: props.request_data_source_url
                                })
                              }}
                            />

                            <br />

                            <div className="govuk-hint">{props.t('publish.providers.add_source.form.source.hint')}</div>

                            <select
                              id="source"
                              name="source_id"
                              className="govuk-select govuk-!-width-full"
                              aria-describedby="source-hint"
                            >
                              <option value="" selected disabled></option>
                              {props.availableSources.map((source) => (
                                <option
                                  key={source.id}
                                  value={source.id}
                                  selected={props.dataProvider?.source_id === source.id}
                                >
                                  {source.name}
                                </option>
                              ))}
                            </select>
                          </fieldset>
                          <script
                            type="text/javascript"
                            dangerouslySetInnerHTML={{
                              __html: `
                                    (() => {
                                      accessibleAutocomplete.enhanceSelectElement({
                                        selectElement: document.querySelector('#source'),
                                        autoSelect: true,
                                        showAllValues: true,
                                        defaultValue: ''
                                      })
                                    })();`
                            }}
                          ></script>
                        </div>
                      )
                    },
                    {
                      value: 'false',
                      label: props.t('publish.providers.add_source.form.has_source.options.no.label')
                    }
                  ]}
                />

                <button type="submit" className="govuk-button" data-module="govuk-button">
                  {props.t('buttons.continue')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
