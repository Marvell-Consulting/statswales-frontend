import React from 'react';
import Layout from '../components/Layout';
import ErrorHandler from '../components/ErrorHandler';
import { clsx } from 'clsx';

export default function Title(props) {
  const returnLink =
    props.revisit && props.datasetId && props.buildUrl(`/publish/${props.datasetId}/tasklist`, props.i18n.language);
  const backLink = props.revisit && returnLink;

  const title = props.t('publish.title.heading');
  return (
    <Layout {...props} backLink={backLink} returnLink={returnLink} formPage title={title}>
      <h1 className="govuk-heading-xl">{title}</h1>

      <ErrorHandler />

      <ul className="govuk-list govuk-list--bullet">
        <li>{props.t('publish.title.appear')}</li>
        <li>{props.t('publish.title.descriptive')}</li>
      </ul>

      <div className="govuk-hint">{props.t('publish.title.form.title.hint')}</div>

      <form encType="multipart/form-data" method="post">
        <div className="govuk-form-group">
          <input
            className={clsx('govuk-input', {
              'govuk-input--error': props.errors?.find((e) => e.field === 'title')
            })}
            id="title"
            name="title"
            type="text"
            defaultValue={props.title}
          />
        </div>
        <button type="submit" className="govuk-button" data-module="govuk-button">
          {props.t('buttons.continue')}
        </button>
      </form>
    </Layout>
  );
}
