import React, { Fragment } from 'react';
import FlashMessages from '../components/FlashMessages';
import ErrorHandler from '../components/ErrorHandler';
import Layout from '../components/layouts/Publisher';

export default function UserRoles(props) {
  const title = props.t('admin.user.roles.heading', { userName: props.userName });
  return (
    <Layout {...props} formPage title={title}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <FlashMessages />

          <h1 className="govuk-heading-xl">{title}</h1>

          <ErrorHandler />

          <form encType="multipart/form-data" method="post">
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <h2 className="govuk-heading-l">{props.t('admin.user.roles.service.heading')}</h2>

                <div
                  className="govuk-checkboxes govuk-checkboxes--small govuk-checkboxes--bg"
                  data-module="govuk-checkboxes"
                >
                  {props.availableRoles.global.map((role, index) => (
                    <div key={index} className="govuk-checkboxes__item">
                      <input
                        className="govuk-checkboxes__input"
                        id={`role_${role}`}
                        name="global"
                        type="checkbox"
                        value={role}
                        defaultChecked={props.values.global?.includes(role)}
                      />
                      <label className="govuk-label govuk-checkboxes__label" htmlFor={`role_${role}`}>
                        {props.t(`admin.user.roles.form.roles.options.${role}.label`)}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              {props.availableOrganisations.map((organisation, index) => (
                <fieldset key={index} className="govuk-fieldset">
                  <h2 className="govuk-heading-l">{organisation.name}</h2>

                  <div
                    className="govuk-checkboxes govuk-checkboxes--small govuk-checkboxes--bg"
                    data-module="govuk-checkboxes"
                  >
                    {organisation.groups.map((group, index) => (
                      <Fragment key={index}>
                        <div key={index} className="govuk-checkboxes__item">
                          <input
                            className="govuk-checkboxes__input"
                            id={`group_${group.id}`}
                            name="groups"
                            type="checkbox"
                            value={group.id}
                            aria-controls={`conditional-group-${group.id}`}
                            defaultChecked={props.values.groups?.includes(group.id)}
                          />
                          <label className="govuk-label govuk-checkboxes__label" htmlFor={`group_${group.id}`}>
                            {group.name}
                          </label>
                        </div>
                        {props.availableRoles?.group.length > 0 && (
                          <div className="govuk-checkboxes__conditional" id={`conditional-group-${group.id}`}>
                            {props.availableRoles.group.map((role, index) => (
                              <div key={index} className="govuk-checkboxes__item">
                                <input
                                  className="govuk-checkboxes__input"
                                  id={`group_${group.id}_role_${role}`}
                                  name={`group_roles_${group.id}`}
                                  type="checkbox"
                                  value={role}
                                  defaultChecked={props.values[`group_roles_${group.id}`]?.includes(role)}
                                />
                                <label
                                  className="govuk-label govuk-checkboxes__label"
                                  htmlFor={`group_${group.id}_role_${role}`}
                                >
                                  {props.t(`admin.user.roles.form.roles.options.${role}.label`)}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <button type="submit" className="govuk-button" data-module="govuk-button">
              {props.t('buttons.continue')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
