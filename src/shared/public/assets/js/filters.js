(() => {
  function addListeners(filter) {
    const name = filter.getAttribute('id');
    const selectAllCheckboxId = name.trim() + '-all';
    const allCheckbox = filter.querySelector('.filter-head input#' + selectAllCheckboxId);
    const selectedLabel = filter.querySelector('span.number-selected');
    const filteredLabel = filter.querySelector('span.filtered-label');
    const nonFilteredLabel = filter.querySelector('span.non-filtered-label');
    const childDetails = filter.querySelectorAll('details') || [];

    const childCheckboxes = [...filter.querySelectorAll('.filter-body [type="checkbox"]')];

    function checkState() {
      const anyChecked = childCheckboxes.some((c) => c.checked);
      allCheckbox.checked = !anyChecked;
      updateTotals();
    }

    childCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', checkState));

    function updateTotals() {
      const numChecked = childCheckboxes.reduce((sum, check) => sum + (check.checked ? 1 : 0), 0);
      selectedLabel.innerText = numChecked;
      if (numChecked) {
        filteredLabel.classList.remove('js-hidden');
        nonFilteredLabel.classList.add('js-hidden');
      } else {
        filteredLabel.classList.add('js-hidden');
        nonFilteredLabel.classList.remove('js-hidden');
      }
    }

    allCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        childCheckboxes
          .filter((c) => c.checked)
          .forEach((c) => {
            const event = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            c.dispatchEvent(event);
          });
        // collapse children
        childDetails.forEach((el) => el.removeAttribute('open'));
      }
      e.target.checked = true;
      updateTotals();
    });
  }

  const filters = document.querySelectorAll('.filters');

  filters.forEach((filter) => {
    addListeners(filter);

    // Show search input if more than 8 checkboxes
    const allCheckboxes = filter.querySelectorAll('.filter-body [type="checkbox"]');
    const filterSearch = filter.querySelector('.filter-search');
    if (allCheckboxes.length > 8 && filterSearch) {
      filterSearch.classList.remove('js-hidden');

      // Add search functionality
      const searchInput = filterSearch.querySelector('.filter-search-input');
      const filterBody = filter.querySelector('.filter-body');

      // Cache DOM queries outside the debounce
      const checkboxItems = filterBody.querySelectorAll('.govuk-checkboxes__item');
      const detailsElements = filterBody.querySelectorAll('details');
      const noMatchMessage = filterBody.querySelector('.filter-search-no-match');
      let debounceTimer;

      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          const searchTerm = e.target.value.toLowerCase().trim();

          if (searchTerm === '') {
            // Reset: show all and collapse
            checkboxItems.forEach((item) => (item.style.display = ''));
            detailsElements.forEach((details) => {
              details.style.display = '';
              details.removeAttribute('open');
            });
            if (noMatchMessage) noMatchMessage.classList.add('js-hidden');
            return;
          }

          // Mark matching items and their parent details elements
          const matchingItems = new Set();
          const matchingDetails = new Set();

          checkboxItems.forEach((item) => {
            const label = item.querySelector('label');
            if (label && label.textContent.toLowerCase().includes(searchTerm)) {
              matchingItems.add(item);

              // Walk up the details tree and mark parents
              let parent = item.closest('details');
              while (parent && filterBody.contains(parent)) {
                matchingDetails.add(parent);
                const parentItem = parent.querySelector(':scope > summary > .govuk-checkboxes__item');
                if (parentItem) matchingItems.add(parentItem);
                parent = parent.parentElement.closest('details');
              }
            }
          });

          // Apply visibility changes
          checkboxItems.forEach((item) => {
            item.style.display = matchingItems.has(item) ? '' : 'none';
          });

          detailsElements.forEach((details) => {
            if (matchingDetails.has(details)) {
              details.style.display = '';
              details.setAttribute('open', true);
            } else {
              details.style.display = 'none';
              details.removeAttribute('open');
            }
          });

          // Show "no match" message when nothing matches
          if (noMatchMessage) {
            if (matchingItems.size === 0) {
              noMatchMessage.classList.remove('js-hidden');
            } else {
              noMatchMessage.classList.add('js-hidden');
            }
          }
        }, 250);
      });
    }

    const filterBody = filter.querySelector('.filter-body');
    const parentControls = filter.querySelector('.parent-controls');

    filterBody.insertBefore(parentControls, filterBody.firstChild);
    parentControls.classList.remove('js-hidden');

    const controls = filter.querySelectorAll('.controls');

    controls.forEach((control) => {
      control.classList.remove('js-hidden');
      const selectAll = control.querySelector("[data-action='select-all']");
      const clear = control.querySelector("[data-action='clear']");

      const parent = control.parentNode.parentNode;

      const selectors = [
        // nested items with children
        ":scope > .indent > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']",
        // nested items without children
        ":scope > .indent > .govuk-checkboxes .govuk-checkboxes__item > input[type='checkbox']",
        // top-level items with children
        ":scope > .filter-body > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)",
        // top-level items without children
        ":scope > .filter-body > .govuk-checkboxes .govuk-checkboxes__item > input[type='checkbox']:not(.all-filter)"
      ];
      const checkboxes = parent.querySelectorAll(selectors.join(', '));
      const details = parent.querySelectorAll('details') || [];

      selectAll.addEventListener('click', (e) => {
        e.preventDefault();
        checkboxes.forEach((checkbox) => {
          checkbox.checked = true;
          const evt = new Event('change');
          checkbox.dispatchEvent(evt);
        });
        // expand all children
        details.forEach((el) => {
          el.setAttribute('open', true);
        });
        return false;
      });

      clear.addEventListener('click', (e) => {
        e.preventDefault();

        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
          const evt = new Event('change');
          checkbox.dispatchEvent(evt);
        });
        // collapse all children
        details.forEach((el) => {
          el.removeAttribute('open');
        });

        return false;
      });
    });
  });
})();
