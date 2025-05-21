import React from 'react';
import Table from './Table';

export default function TranslationsPreviewTable(props) {
  const columns = [
    {
      key: 'key',
      label: props.t('translations.export.table.field'),
      format: (value, row) => {
        if (row.type === 'dimension') {
          return props.t(`translations.export.dimension`, { key: value });
        } else if (row.type === 'measure') {
          return props.t(`translations.export.measure`, { key: value });
        } else if (row.type === 'metadata') {
          return props.t(`translations.export.field.${value}`);
        } else if (row.type === 'link') {
          return props.t(`translations.export.link`, { key: value });
        }
      }
    },
    {
      key: props.i18n.language.includes('en') ? 'english' : 'cymraeg',
      label: props.isImport
        ? props.i18n.language.includes('en')
          ? props.t('translations.import.table.english')
          : props.t('translations.import.table.welsh')
        : props.t('translations.export.table.value')
    },
    ...(props.isImport
      ? [
          {
            key: props.i18n.language.includes('en') ? 'cymraeg' : 'english',
            label: props.i18n.language.includes('en')
              ? props.t('translations.import.table.welsh')
              : props.t('translations.import.table.english')
          }
        ]
      : [
          {
            key: 'edit_link',
            label: props.t('translations.export.table.action'),
            format: (value) => <a href={value}>{props.t('translations.export.buttons.change')}</a>
          }
        ])
  ];
  return <Table {...props} columns={columns} rows={props.translations} />;
}
