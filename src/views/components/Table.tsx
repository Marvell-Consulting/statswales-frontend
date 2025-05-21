import React, { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import T from './T';

type ColumnBase<T> = {
  key: (keyof T & string) | number;
  className?: string;
  cellClassName?: string;
  style?: CSSProperties;
  format?: (value: any, row: T) => ReactNode;
};

type ColumnWithLabel<T> = ColumnBase<T> & {
  label: ReactNode;
};

type ColumnWithOptionalLabel<T> = ColumnBase<T> & {
  label?: ReactNode;
};

type TablePropsBase<T> = {
  rows: T[];
  colgroup?: ReactNode;
  inverted?: boolean;
  isSticky?: boolean;
  i18nBase?: string;
};

export type TableProps<T> =
  | (TablePropsBase<T> & {
      columns: ColumnWithLabel<T>[];
    })
  | (TablePropsBase<T> & {
      columns: Array<ColumnWithOptionalLabel<T> | ((keyof T & string) | number)>;
      i18nBase: string;
    });

export default function Table<T>({ columns, rows, colgroup, inverted, isSticky, i18nBase }: TableProps<T>) {
  return (
    <div className="govuk-table__container">
      <table className={clsx('govuk-table', { 'sticky-table': isSticky })}>
        {colgroup && <colgroup>{colgroup}</colgroup>}
        {inverted ? (
          <tbody className="govuk-table__body">
            {rows.map((row, rIx) =>
              columns.map((col, cIx) => {
                const hasLabel = typeof col === 'object' && 'label' in col;

                return (
                  <tr key={`${rIx}-${cIx}`}>
                    <th scope="row" className="govuk-table__header">
                      {hasLabel ? (
                        col.label
                      ) : (
                        <T>
                          {i18nBase}.{typeof col === 'object' ? col.key : col}
                        </T>
                      )}
                    </th>
                    <td className="govuk-table__cell">
                      {typeof col === 'object'
                        ? col.format
                          ? col.format(row[col.key as keyof typeof row], row)
                          : (row[col.key as keyof typeof row] as ReactNode)
                        : (row[col as keyof typeof row] as ReactNode)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        ) : (
          <>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                {columns.map((col, index) => {
                  const isObject = typeof col === 'object';
                  const hasLabel = isObject && 'label' in col;
                  return (
                    <th
                      key={index}
                      scope="col"
                      className={clsx('govuk-table__header', isObject && col.className)}
                      style={isObject ? col.style : undefined}
                    >
                      {hasLabel ? (
                        col.label
                      ) : (
                        <T>
                          {i18nBase}.{typeof col === 'object' ? col.key : col}
                        </T>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {rows.map((row, index) => (
                <tr key={index} className="govuk-table__row">
                  {columns.map((col, index) => {
                    const isObject = typeof col === 'object';
                    return (
                      <td key={index} className={clsx('govuk-table__cell', isObject && col.cellClassName)}>
                        {isObject
                          ? col.format
                            ? col.format(row[col.key as keyof typeof row], row)
                            : (row[col.key as keyof typeof row] as ReactNode)
                          : (row[col as keyof typeof row] as ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </>
        )}
      </table>
    </div>
  );
}
