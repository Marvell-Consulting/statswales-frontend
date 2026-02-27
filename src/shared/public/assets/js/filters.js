(() => {
  function addListeners(filter) {
    const selectedLabel = filter.querySelector('span.number-selected');

    const childCheckboxes = [...filter.querySelectorAll('.filter-body [type="checkbox"]')];

    function checkState() {
      updateTotals();
    }

    childCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', checkState));

    function updateTotals() {
      const numChecked = childCheckboxes.reduce((sum, check) => sum + (check.checked ? 1 : 0), 0);
      selectedLabel.innerText = numChecked;
    }
  }

  const filters = document.querySelectorAll('.filter');

  // On submit, disable all checkboxes for filters where every option is checked
  // so the server receives an empty selection (= no filter applied).
  const form = document.querySelector('.filters-container')?.closest('form');
  if (form) {
    form.addEventListener('submit', () => {
      filters.forEach((filter) => {
        const boxes = [...filter.querySelectorAll('.filter-body [type="checkbox"]')];
        const total = Number(filter.dataset.total);
        const numChecked = boxes.reduce((sum, cb) => sum + (cb.checked ? 1 : 0), 0);
        if (numChecked === total) {
          boxes.forEach((cb) => (cb.disabled = true));
        }
      });
    });
  }

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

    // Show filter-head (contains root controls, hidden without JS)
    const filterHead = filter.querySelector('.filter-head');
    if (filterHead) filterHead.classList.remove('js-hidden');

    const controls = filter.querySelectorAll('.filter-controls');

    controls.forEach((control) => {
      control.classList.remove('js-hidden');
      const toggle = control.querySelector("[data-action='toggle']");
      const deselectSpan = control.querySelector('.toggle-deselect');
      const selectSpan = control.querySelector('.toggle-select');

      const isRoot = control.classList.contains('root-controls');

      let checkboxes;

      if (isRoot) {
        // Root control: toggle ALL checkboxes in the filter (including nested children)
        const filterEl = control.closest('.filter');
        checkboxes = filterEl.querySelectorAll(".filter-body input[type='checkbox']");
      } else {
        // Nested "at this level" control: only immediate children, not deeper descendants
        const parent = control.parentNode.parentNode;
        const selectors = [
          // immediate children that have their own children (inside details > summary)
          ":scope > .indent > .govuk-checkboxes > details > summary > .govuk-checkboxes__item > input[type='checkbox']",
          // immediate children without children (direct items)
          ":scope > .indent > .govuk-checkboxes > .govuk-checkboxes__item > input[type='checkbox']"
        ];
        checkboxes = parent.querySelectorAll(selectors.join(', '));
      }

      function updateToggleLabel() {
        const allChecked = [...checkboxes].every((cb) => cb.checked);
        if (allChecked) {
          deselectSpan.classList.remove('js-hidden');
          selectSpan.classList.add('js-hidden');
        } else {
          deselectSpan.classList.add('js-hidden');
          selectSpan.classList.remove('js-hidden');
        }
      }

      // Set initial label state
      updateToggleLabel();

      // Update label when any checkbox changes
      checkboxes.forEach((cb) => cb.addEventListener('change', updateToggleLabel));

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const allChecked = [...checkboxes].every((cb) => cb.checked);

        checkboxes.forEach((checkbox) => {
          checkbox.checked = !allChecked;
          const evt = new Event('change');
          checkbox.dispatchEvent(evt);
        });

        return false;
      });
    });
  });
  // Handle "Change values" links from the summary table
  document.querySelectorAll('a[href^="#filter-"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const filterEl = document.getElementById(targetId);
      if (!filterEl) return;

      e.preventDefault();

      const accordion = filterEl.querySelector('.dimension-accordion');
      if (accordion) accordion.setAttribute('open', '');

      const container = filterEl.querySelector('.filter-container');
      if (container) {
        filterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
        container.focus({ preventScroll: true });
      }
    });
  });
})();
