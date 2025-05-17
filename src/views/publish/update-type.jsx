import React from 'react';
import Layout from '../components/layouts/Publisher';
import ErrorHandler from '../components/ErrorHandler';

export default function UpdateType(props) {
  const backLink = 'javascript:history.back()';
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink}>
      <div className="form-background">
        <div className="govuk-width-container app-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <ErrorHandler {...props} />

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <form method="post" role="continue" id="updateType">
                  <div className="govuk-form-group">
                    <fieldset className="govuk-fieldset">
                      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h2 className="govuk-fieldset__heading">{props.t('publish.update_type.heading')}</h2>
                      </legend>
                      <div className="govuk-radios" data-module="govuk-radios">
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="updateTypeAdd"
                            name="updateType"
                            type="radio"
                            value="add"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="updateTypeAdd">
                            {props.t('publish.update_type.add')}
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="updateTypeAddRevise"
                            name="updateType"
                            type="radio"
                            value="add_revise"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="updateTypeAddRevise">
                            {props.t('publish.update_type.add_revise')}
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="updateTypeRevise"
                            name="updateType"
                            type="radio"
                            value="revise"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="updateTypeRevise">
                            {props.t('publish.update_type.revise')}
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="updateTypeReplaceAll"
                            name="updateType"
                            type="radio"
                            value="replace_all"
                          />
                          <label className="govuk-label govuk-radios__label" htmlFor="updateTypeReplaceAll">
                            {props.t('publish.update_type.replace_all')}
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div className="govuk-button-group">
                    <button
                      type="submit"
                      name="confirm"
                      value="true"
                      className="govuk-button"
                      data-module="govuk-button"
                      style={{ verticalAlign: 'unset' }}
                      data-prevent-double-click="true"
                    >
                      {props.t('buttons.continue')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
