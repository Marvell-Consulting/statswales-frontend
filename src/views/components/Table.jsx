import React from 'react';
import clsx from 'clsx';

export default function Table({ columns, rows, colgroup, inverted, isSticky, t, i18nBase }) {
  return (
    <div className="govuk-table__container">
      <table className={clsx('govuk-table', { 'sticky-table': isSticky })}>
        {colgroup && <colgroup>{colgroup}</colgroup>}
        {inverted ? (
          <tbody className="govuk-table__body">
            {rows.map((row, rIx) =>
              columns.map((col, cIx) => (
                <tr key={`${rIx}-${cIx}`}>
                  <th scope="row" className="govuk-table__header">
                    {typeof col === 'string' || (!col.label && col.label !== '')
                      ? t(`${i18nBase}.${col.key || col}`)
                      : col.label}
                  </th>
                  <td className="govuk-table__cell">
                    {typeof col === 'string' ? row[col] : col.format ? col.format(row[col.key], row) : row[col.key]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        ) : (
          <>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={clsx('govuk-table__header', col.className)}
                    style={col.style || undefined}
                  >
                    {typeof col === 'string' || (!col.label && col.label !== '')
                      ? t(`${i18nBase}.${col.key || col}`)
                      : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {rows.map((row, index) => (
                <tr key={index} className="govuk-table__row">
                  {columns.map((col, index) => (
                    <td key={index} className={clsx('govuk-table__cell', col.cellClassName)}>
                      {typeof col === 'string' ? row[col] : col.format ? col.format(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </>
        )}
      </table>
    </div>
  );
}
