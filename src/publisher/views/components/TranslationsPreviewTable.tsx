import React from 'react';
import Table from '../../../shared/views/components/Table';
import { TranslationDTO } from '../../../shared/dtos/translations';
import T from '../../../shared/views/components/T';
import { useLocals } from '../../../shared/views/context/Locals';

export type TranslationsPreviewTableProps = {
  isImport?: boolean;
  translations: TranslationDTO[];
};

export default function TranslationsPreviewTable({ isImport, translations }: TranslationsPreviewTableProps) {
  const { i18n } = useLocals();
  const columns = [
    {
      key: 'key' as keyof TranslationDTO,
      label: <T>translations.export.table.field</T>,
      format: (value: string, row: TranslationDTO) => {
        if (row.type === 'dimension') {
          return <T value={value}>translations.export.dimension</T>;
        } else if (row.type === 'measure') {
          return <T value={value}>translations.export.measure</T>;
        } else if (row.type === 'metadata') {
          return <T>translations.export.field.{value}</T>;
        } else if (row.type === 'link') {
          return <T value={value}>translations.export.link</T>;
        }
      }
    },
    {
      key: (i18n.language.includes('en') ? 'english' : 'cymraeg') as keyof TranslationDTO,
      label: isImport ? (
        i18n.language.includes('en') ? (
          <T>translations.import.table.english</T>
        ) : (
          <T>translations.import.table.welsh</T>
        )
      ) : (
        <T>translations.export.table.value</T>
      ),
      format: (value: string) => <div dangerouslySetInnerHTML={{ __html: value }} />
    },
    ...(isImport
      ? [
          {
            key: (i18n.language.includes('en') ? 'cymraeg' : 'english') as keyof TranslationDTO,
            label: i18n.language.includes('en') ? (
              <T>translations.import.table.welsh</T>
            ) : (
              <T>translations.import.table.english</T>
            ),
            format: (value: string) => <div dangerouslySetInnerHTML={{ __html: value }} />
          }
        ]
      : [
          {
            key: 'edit_link' as keyof TranslationDTO,
            label: <T>translations.export.table.action</T>,
            format: (value: TranslationDTO['edit_link']) => (
              <a href={value}>
                <T>translations.export.buttons.change</T>
              </a>
            )
          }
        ])
  ];
  return <Table<TranslationDTO> columns={columns} rows={translations} />;
}
