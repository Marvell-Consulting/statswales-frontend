import React, { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import T from './T';
import { useLocals } from '../../../shared/views/context/Locals';
import { SortByInterface } from '../../../shared/interfaces/sort-by';
import qs from 'qs';
import { omit, size } from 'lodash';

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
  isSortable?: boolean;
};

export type TableProps<T> =
  | (TablePropsBase<T> & {
      columns: ColumnWithLabel<T>[];
    })
  | (TablePropsBase<T> & {
      columns: Array<ColumnWithOptionalLabel<T> | ((keyof T & string) | number)>;
      i18nBase: string;
    });

function TableHeader<T>({
  scope,
  i18nBase,
  col,
  sortBy,
  query,
  originalUrl,
  isSortable
}: {
  i18nBase?: string;
  scope: 'col' | 'row';
  col: string | number | ColumnWithLabel<T> | ColumnWithOptionalLabel<T>;
  sortBy?: SortByInterface;
  query: ReturnType<(typeof qs)['parse']>;
  originalUrl: string;
  isSortable?: boolean;
}) {
  const isObject = typeof col === 'object';
  const hasLabel = isObject && 'label' in col;

  const colKey = String(typeof col === 'object' ? col.key : col);

  const label = hasLabel ? (
    col.label
  ) : (
    <T>
      {i18nBase}.{colKey}
    </T>
  );

  const sortKey = isObject ? col.label : col;

  function getSortParams() {
    if (!isSortable) {
      return null;
    }

    if (!sortBy || sortBy.columnName !== sortKey) {
      return { columnName: sortKey, direction: 'ASC' };
    }

    if (sortBy.direction === 'ASC') {
      return { columnName: sortKey, direction: 'DESC' };
    }

    return null;
  }

  function getSortUrl() {
    if (!isSortable) {
      return null;
    }

    const params = getSortParams();
    const newQuery = params ? qs.stringify({ ...query, sort_by: params }) : qs.stringify(omit(query, 'sort_by'));

    return size(newQuery) ? `${originalUrl}?${newQuery}` : originalUrl;
  }

  const sortUrl = getSortUrl();

  return (
    <th
      scope={scope}
      className={clsx('govuk-table__header', isObject && col.className)}
      style={isObject ? col.style : undefined}
      aria-sort={
        sortKey === sortBy?.columnName ? (sortBy?.direction === 'ASC' ? 'ascending' : 'descending') : undefined
      }
    >
      {sortUrl ? <a href={sortUrl}>{label}</a> : label}
    </th>
  );
}

export default function Table<T>({ columns, rows, colgroup, inverted, isSticky, i18nBase, isSortable }: TableProps<T>) {
  const { url } = useLocals();
  const [originalUrl, query] = url.split('?');

  const parsed = qs.parse(query);

  return (
    <div className="govuk-table__container">
      <table className={clsx('govuk-table', { 'sticky-table': isSticky, sortable: isSortable })}>
        {colgroup && <colgroup>{colgroup}</colgroup>}
        {inverted ? (
          <tbody className="govuk-table__body">
            {rows.map((row, rIx) =>
              columns.map((col, cIx) => {
                return (
                  <tr key={`${rIx}-${cIx}`}>
                    <TableHeader<T>
                      i18nBase={i18nBase}
                      scope="row"
                      col={col}
                      sortBy={isSortable ? (parsed.sort_by as unknown as SortByInterface) : undefined}
                      query={parsed}
                      originalUrl={originalUrl}
                      isSortable={isSortable}
                    />
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
                {columns?.map((col, index) => {
                  return (
                    <TableHeader<T>
                      key={index}
                      i18nBase={i18nBase}
                      scope="col"
                      col={col}
                      sortBy={isSortable ? (parsed.sort_by as unknown as SortByInterface) : undefined}
                      query={parsed}
                      originalUrl={originalUrl}
                      isSortable={isSortable}
                    />
                  );
                })}
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {rows?.map((row, index) => (
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
