import { clsx } from 'clsx';
import React, { ReactNode, useState } from 'react';

type Tab = {
  id: string;
  label: ReactNode;
  children?: ReactNode;
};

export type TabsProps = {
  id?: string;
  tabs: Tab[];
  title?: string;
};

export default function Tabs({ id, tabs, title }: TabsProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <div className="govuk-tabs">
      <div className="tabs" id={id}>
        <div className="govuk-width-container">
          <div className="govuk-main-wrapper govuk-!-padding-bottom-0">
            {title && <h2 className="govuk-tabs__title">{title}</h2>}
            <ul className="govuk-tabs__list" role="tablist">
              {tabs.map((tab, i) => (
                <li
                  key={tab.id}
                  className={clsx('govuk-tabs__list-item', { 'govuk-tabs__list-item--selected': i === activeTabIndex })}
                  role="presentation"
                >
                  <a
                    className="govuk-tabs__tab"
                    href={`#${tab.id}`}
                    id={`tab_${tab.id}`}
                    role="tab"
                    aria-controls={tab.id}
                    aria-selected={i === activeTabIndex}
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTabIndex(i);
                    }}
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
          <div
            key={tab.id}
            className={clsx('govuk-tabs__panel', {
              'govuk-tabs__panel--hidden': tabs.indexOf(tab) !== activeTabIndex
            })}
            id={tab.id}
            role="tabpanel"
            aria-labelledby={`tab_${tab.id}`}
          >
            {tab.children}
          </div>
        ))}
    </div>
  );
}
