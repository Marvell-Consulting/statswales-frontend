import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

type Tab = {
  id: string;
  label: ReactNode;
  children?: ReactNode;
};

export type TabsProps = {
  tabs: Tab[];
  title?: string;
};

export default function Tabs({ tabs, title }: TabsProps) {
  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <div className="tabs">
        <div className="govuk-width-container">
          <div className="govuk-main-wrapper govuk-!-padding-bottom-0">
            {title && <h2 className="govuk-tabs__title">{title}</h2>}
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
        .map((tab, i) => (
          <div key={i} className="govuk-tabs__panel" id={tab.id} role="tabpanel" aria-labelledby={`tab_${tab.id}`}>
            {tab.children}
          </div>
        ))}
    </div>
  );
}
