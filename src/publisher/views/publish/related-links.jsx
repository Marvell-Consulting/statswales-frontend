import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import Table from '../../../shared/views/components/Table';
import clsx from 'clsx';
import RadioGroup from '../../../shared/views/components/RadioGroup';
import T from '../../../shared/views/components/T';

export default function RelatedLinks(props) {
  const returnLink = props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.referrer;

  const columns = [
    {
      key: 'url',
      label: props.t('publish.related.list.table.link'),
      format: (value, row) => {
        const notTranslated = `[${props.t('publish.related.list.not_translated')}]`;
        const label = props.i18n.language.includes('en')
          ? row.label_en || `${row.label_cy} ${notTranslated}`
          : row.label_cy || `${row.label_en} ${notTranslated}`;
        return (
          <a href={value} className="govuk-link">
            {label}
          </a>
        );
      }
    },
    {
      key: 'id',
      label: props.t('publish.related.list.table.action_header'),
      format: (value) => {
        const editLink = props.buildUrl(`/publish/${props.datasetId}/related?edit=${value}`, props.i18n.language);
        const deleteLink = props.buildUrl(`/publish/${props.datasetId}/related?delete=${value}`, props.i18n.language);
        return (
          <ul className="govuk-summary-list__actions-list">
            <li className="govuk-summary-list__actions-list-item">
              <a href={editLink} className="govuk-link">
                {props.t('publish.related.list.table.action_edit')}
              </a>
            </li>
            <li className="govuk-summary-list__actions-list-item">
              <a href={deleteLink} className="govuk-link">
                {props.t('publish.related.list.table.action_delete')}
              </a>
            </li>
          </ul>
        );
      },
      cellClassNameName: 'nowrap'
    }
  ];

  const title =
    props.related_links.length > 0 && !props.editId
      ? props.t('publish.related.list.heading')
      : props.t('publish.related.add.heading');

  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{title}</h1>

            <ErrorHandler />
            {props.related_links.length > 0 && !props.editId ? (
              <>
                <Table columns={columns} rows={props.related_links} />

                <form encType="multipart/form-data" method="post">
                  <input type="hidden" name="add_another" value="true" />
                  <RadioGroup
                    name="add_link"
                    label={<T>publish.related.list.form.add_another.heading</T>}
                    options={[
                      {
                        value: 'true',
                        label: <T>publish.related.list.form.add_another.options.yes.label</T>
                      },
                      {
                        value: 'false',
                        label: <T>publish.related.list.form.add_another.options.no.label</T>
                      }
                    ]}
                  />
                  <button type="submit" className="govuk-button" data-module="govuk-button">
                    {props.t('buttons.continue')}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="govuk-body">{props.t('publish.related.add.explain')}</p>

                <ul className="govuk-list govuk-list--bullet">
                  <li>{props.t('publish.related.add.explain_1')}</li>
                  <li>{props.t('publish.related.add.explain_2')}</li>
                  <li>{props.t('publish.related.add.explain_3')}</li>
                </ul>

                <form encType="multipart/form-data" method="post">
                  <fieldset className="govuk-fieldset">
                    <input type="hidden" name="link_id" value={props.link.id} />
                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'link_url')
                      })}
                    >
                      <label className="govuk-label" htmlFor="link_url">
                        {props.t('publish.related.add.form.link_url.label')}
                      </label>
                      <div className="govuk-hint">{props.t('publish.related.add.form.link_url.hint')}</div>
                      {props.errors?.find((e) => e.field === 'link_url') && (
                        <p id="link_url-error" className="govuk-error-message">
                          {props.t(
                            `publish.related.add.form.link_url.error.${props.link?.url ? 'invalid' : 'missing'}`
                          )}
                        </p>
                      )}

                      <input
                        className={clsx('govuk-input', {
                          'govuk-input--error': props.errors?.find((e) => e.field === 'link_url')
                        })}
                        id="link_url"
                        name="link_url"
                        type="text"
                        defaultValue={props.link.url}
                      />
                    </div>
                    <div
                      className={clsx('govuk-form-group', {
                        'govuk-form-group--error': props.errors?.find((e) => e.field === 'link_label')
                      })}
                    >
                      <label className="govuk-label" htmlFor="link_label">
                        {props.t('publish.related.add.form.link_label.label')}
                      </label>
                      <div className="govuk-hint">{props.t('publish.related.add.form.link_label.hint')}</div>
                      {props.errors?.find((e) => e.field === 'link_label') && (
                        <p id="link_label-error" className="govuk-error-message">
                          {props.t('publish.related.add.form.link_label.error.missing')}
                        </p>
                      )}
                      <input
                        className={clsx('govuk-input', {
                          'govuk-input--error': props.errors?.find((e) => e.field === 'link_label')
                        })}
                        id="link_label"
                        name="link_label"
                        type="text"
                        defaultValue={props.link.label}
                      />
                    </div>
                  </fieldset>
                  <button type="submit" className="govuk-button" data-module="govuk-button">
                    {props.t('buttons.continue')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
