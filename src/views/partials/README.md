# Template partials

## table.ejs

A table partial that can be used to render govuk table markup for a variety of tables.

### Usage

The following keys can be provided to the partial:

- `columns: <string | Column>[]`: an array of keys or column configs (see below)
- `rows: Record<string, any>[]`: the table data
- `i18nBase: string`: the i18n base to append keys when looking up translations (required if config uses any string columns)
- `isSticky? boolean`: adds the `sticky-table` class to the `<table>` element
- `inverted?: boolean`: renders an inverted 2 column table with each row containing a `<th/><td/>`
- `colgroup?: html string`: renders a `<colgroup>`

### Object columns

Columns can accept an `Object` with the following keys:

- `key: string`: the key to extract data from the row. Eg, `id` will map to `row.id`
- `label: html string`: the column header content, can accept html strings
- `format?: (value: any, row: Row) => html string`: a function to call when rendering the data, receives data value as first arg and full row as second.
- `className?: string`: optional html class to apply to `<th>` element
- `cellClassName?: string`: optional html class to apply to `<td>` element

### Examples

#### Simple interface

If the translation keys match the data keys then `string` values can be passed for columns:

```ejs
<%- include("../partials/table", {
  i18nBase: 'developer.display',
  columns: [
    'reference',
    'format',
    'decimals',
    'description',
    'notes',
    'sort_order',
    'hierarchy'
  ],
  rows: dataset.measure.measure_table
}); %>
```

Rows will be rendered in the order specified be the columns, each column will be rendered using the i18nBase - eg `t('developer.base.display')`

#### Mapped keys

If the data keys don't match up exactly the rows array can be mapped:

```ejs
<%- include("../partials/table", {
  i18nBase: 'developer.display',
  columns: [
    'id',
    'fact_table_column',
    'name',
    'description',
    'notes'
  ],
  rows: locals.dataset?.dimensions.map(dim => ({
    ...dim,
    ...dim.metadata,
    fact_table_column: dim.factTableColumn
  }))
}); %>
```

#### Inverted columns

For TH:TD 2 column layouts pass `inverted: true` to the partial

```ejs
<%- include("../partials/table", {
  inverted: true,
  i18nBase: 'developer.display',
  columns: [
    'id',
    'mime_type',
    'file_type',
    'filename',
    'hash',
    'uploaded_at',
    'download'
  ],
  rows: [{
      ...locals.dataset?.measure.lookup_table,
      uploaded_at: dateFormat(locals.dataset?.measure.lookup_table.uploaded_at, 'd MMMM yyyy h:mm a', { locale: i18n.language })
  }]
}); %>
```

#### Cell formatters

A `format` function can be passed to a column config to format the data for that row. This should return the formatted data and can be a html string

##### Simple example

```ejs
<%- include("../partials/table", {
  inverted: true,
  columns: [
    {
      key: 'created_at',
      label: t('developer.display.created_at'),
      format: (value) => value
        ? dateFormat(value, 'd MMMM yyyy h:mm a', { locale: i18n.language })
        : ''
    },
    {
      key: 'live',
      label: t('developer.display.live'),
      format: (value) => value
        ? dateFormat(value, 'd MMMM yyyy h:mm a', { locale: i18n.language })
        : ''
    },
  ],
  rows: [
    {
      created_at: locals.dataset.created_at,
      live: locals.dataset.live
    },
  ]
}); %>
```

##### Example returning HTML

```ejs
<%- include("../partials/table", {
  columns: [
    {
      key: 'url',
      label: t('publish.related.list.table.link'),
      format: (value, row) => {
        const notTranslated = `[${t('publish.related.list.not_translated')}]`
        const label = i18n.language.includes('en')
          ? row.label_en || `${row.label_cy} ${notTranslated}`
          : row.label_cy || `${row.label_en} ${notTranslated}`
        return `<a href="${value}" class="govuk-link">${label}</a>`
      }
    },
    {
      key: 'id',
      label: t('publish.related.list.table.action_header'),
      format: (value) => {
        const editLink = buildUrl(`/publish/${locals.datasetId}/related?edit=${value}`, i18n.language)
        const deleteLink = buildUrl(`/publish/${locals.datasetId}/related?delete=${value}`, i18n.language)
        return `<ul class="govuk-summary-list__actions-list">
          <li class="govuk-summary-list__actions-list-item">
            <a href="${editLink}" class="govuk-link">
              ${t('publish.related.list.table.action_edit')}
            </a>
          </li>
          <li class="govuk-summary-list__actions-list-item">
            <a href="${deleteLink}" class="govuk-link">
              ${t('publish.related.list.table.action_delete')}
            </a>
          </li>
        </ul>`
      },
      cellClassName: 'nowrap'
    },
  ],
  rows: locals.related_links
}) %>
```

#### Mapped columns

Data tables with non-object rows should render each cell in order using header index provided from server, example preview dataset:

```ejs
<%- include("../../partials/table", {
  isSticky: true,
  columns: headers.map((col, index) => ({
    key: index,
    label: col.name,
    format: (value) => col.source_type === 'line_number'
      ? `<span class="linespan">${value}</span>`
      : col.name === t('consumer_view.start_data') || col.name === t('consumer_view.end_data')
        ? dateFormat(parseISO(value.split('T')[0]), 'do MMMM yyyy')
        : value,
    className: col.source_type === 'line_number' ? 'line-number' :'',
    cellClassName: col.source_type === 'line_number' ? 'line-number' :''
  })),
  rows: data
}); %>

```

#### <colgroup>

An optional colgroup can be included by returning a string of the concatenated `<col>` elements:

```ejs
<%- include("../partials/table", {
  colgroup: locals.headers.reduce((out, header) => {
    return out + `<col class="${header.type === 'ignore' ? 'ignore-column' : ''}" />`
  }, ''),
  columns: locals.headers.map((col, index) => ({
    key: index,
    label: col.source_type === 'line_number'
      ? `<span class="govuk-visually-hidden">${t('publish.preview.row_number')}</span>`
      : (() => {
        if (col.source_type && col.source_type !== 'unknown' && col.source_type !== 'line_number') {
          const label = t(`publish.preview.source_type.${col.source_type}`)
          return `<span class="region-subhead">${label}</span><br />`
        }
        return col.name || t('publish.preview.unnamed_column', { colNum: index + 1 })
      })(),
    cellClassName: col.source_type
  })),
  rows: data
}); %>
```
