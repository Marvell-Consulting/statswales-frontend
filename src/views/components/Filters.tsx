import React from 'react';
import { FilterTable } from '../../dtos/filter-table';
import { CheckboxGroup, CheckboxOptions } from './CheckboxGroup';
import qs from 'qs';
import { get } from 'lodash';

export type FiltersProps = {
  filters: FilterTable[];
  url: string;
};

const normalizeFilters = (options: FilterTable['values']): CheckboxOptions[] => {
  return options.map((opt) => {
    return {
      label: opt.description,
      value: opt.description,
      children: opt.children ? normalizeFilters(opt.children) : undefined
    };
  });
};

export const Filters = ({ filters, url }: FiltersProps) => {
  const parsedFilter = qs.parse(url.split('?')[1])?.filter;
  return (
    <>
      {filters?.map((filter, index) => {
        const values = get(parsedFilter, filter.columnName);

        return (
          <div
            className="filters"
            id={`filter-${filter.factTableColumn}`}
            key={index}
            data-values={JSON.stringify(values)}
          >
            <h3 className="region-subhead">{filter.columnName}</h3>
            <div className="filter-container option-select">
              <CheckboxGroup
                name={`filter[${filter.columnName}]`}
                options={normalizeFilters(filter.values)}
                values={Array.isArray(values) ? values : [values]}
              />
            </div>
          </div>
        );
      })}
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
          (() => {
            function createCheckbox(filter) {
              const name = filter.getAttribute("id")
              const values = filter.getAttribute("data-values");
              const div = document.createElement("div");
              div.classList.add("govuk-checkboxes__item");
            
              const allCheckbox = document.createElement("input")
              allCheckbox.classList.add("govuk-checkboxes__input", "checkboxes__input__filter");
              allCheckbox.setAttribute("id", name + "-all")
              allCheckbox.setAttribute("type", "checkbox");
              if (!values) {
                allCheckbox.setAttribute("checked", true);
              }

              const label = document.createElement("label");
              label.classList.add("govuk-label", "govuk-checkboxes__label", "checkboxes__label__filter")
              label.setAttribute("for", name + "-all");
              label.innerText = "All"

              div.appendChild(allCheckbox)
              div.appendChild(label)

              const childCheckboxes = [...filter.querySelectorAll('[type="checkbox"]')]

              function checkState() {
                const anyChecked = childCheckboxes.some(c => c.checked);

                allCheckbox.checked = !anyChecked
              }
              
              childCheckboxes.forEach(checkbox => checkbox.addEventListener("change", checkState));

              allCheckbox.addEventListener("change", (e) => {
                if (e.target.checked) {
                  childCheckboxes.filter(c => c.checked).forEach(c => {
                    const event = new MouseEvent("click", {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                    });
                    c.dispatchEvent(event)
                  })
                }
                e.target.checked = true;
              })

              return div;
            }

            const filters = document.querySelectorAll(".filters");

            filters.forEach(filter => {
              const checkbox = createCheckbox(filter)
              const parent = filter.querySelector(".option-select > .govuk-checkboxes")
              parent.insertBefore(document.createElement("hr"), parent.firstChild);
              parent.insertBefore(checkbox, parent.firstChild);
            });
            
          })();
          `
        }}
      />
    </>
  );
};
