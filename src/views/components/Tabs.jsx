import clsx from 'clsx';
import React from 'react';

export default function Tabs({ tabs }) {
  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <div className="tabs">
        <div className="govuk-width-container">
          <div className="govuk-main-wrapper govuk-!-padding-bottom-0" id="main-content">
            <ul className="govuk-tabs__list" role="tablist">
              {tabs.map((tab, i) => (
                <li
                  key={i}
                  className={clsx('govuk-tabs__list-item', { 'govuk-tabs__list-item--selected': i === 0 })}
                  role="presentation"
                >
                  <a
                    className="govuk-tabs__tab"
                    href={`#${tab.id}`}
                    id={`tab_${tab.id}`}
                    role="tab"
                    aria-controls={tab.id}
                    // aria-selected={i === 0 ? true : false}
                    tabIndex={i}
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {tabs
        .filter((t) => t.children)
        .map((tab) => (
          <div className="govuk-tabs__panel" id={tab.id} role="tabpanel" aria-labelledby={`tab_${tab.id}`}>
            {tab.children}
          </div>
        ))}
    </div>
  );
}
