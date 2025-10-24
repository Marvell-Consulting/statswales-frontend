import React from 'react';

import T from '../../../../shared/views/components/T';
import { useLocals } from '../../../../shared/views/context/Locals';
import { CubeBuildResult } from '../../../../shared/dtos/cube-build-result';
import Json from '../../components/developer/Json';

type BuildTabProps = {
  cubeBuildResult: CubeBuildResult;
};

export function BuildTab({ cubeBuildResult }: BuildTabProps) {
  const { dateFormat, i18n } = useLocals();

  let memoryUsage: React.JSX.Element | undefined;
  if (cubeBuildResult.memory_usage) {
    const memUsage: React.JSX.Element[] = [];
    for (const [key, value] of Object.entries(cubeBuildResult.memory_usage)) {
      memUsage.push(
        <>
          <tr>
            <td className={'govuk-table__cell'}>
              <T>publish.overview.build.memory.{key}</T>
            </td>
            <td className={'govuk-table__cell'}>{(value / 1000000).toFixed(2)} MB</td>
          </tr>
        </>
      );
    }
    memoryUsage = (
      <>
        <h2 className={'govuk-heading-m'}>
          <T>publish.overview.build.memory_usage</T>
        </h2>
        <table className={'govuk-table'}>
          <thead className={'govuk-table__head'}>
            <tr className={'govuk-table__row'}>
              <th className={'govuk-table__header'} scope={'column'}>
                <T>publish.overview.build.memory.type</T>
              </th>
              <th className={'govuk-table__header'} scope={'column'}>
                <T>publish.overview.build.memory.usage</T>
              </th>
            </tr>
          </thead>
          <tbody>{memUsage}</tbody>
        </table>
      </>
    );
  }

  let error: React.JSX.Element | undefined;
  if (cubeBuildResult.error) {
    const json = { datasetJson: JSON.stringify(cubeBuildResult.error, null, 2) };
    error = (
      <>
        <h2 className={'govuk-heading-m'}>
          <T>publish.overview.build.errors</T>
        </h2>
        <Json {...json} />
      </>
    );
  }

  return (
    <>
      <h2 className={'govuk-heading-m'}>
        <T>publish.overview.build.stats</T>
      </h2>
      <table className={'govuk-table'}>
        <thead className={'govuk-table__head'}>
          <tr className={'govuk-table__row'}>
            <th className={'govuk-table__header'} scope={'column'}>
              <T>publish.overview.build.total_time</T>
            </th>
            <th className={'govuk-table__header'} scope={'column'}>
              <T>publish.overview.build.start_time</T>
            </th>
            <th className={'govuk-table__header'} scope={'column'}>
              <T>publish.overview.build.finish_time</T>
            </th>
          </tr>
        </thead>
        <tbody className={'govuk-table__body'}>
          <tr className={'govuk-table__row'}>
            <td className={'govuk-table__cell'}>
              {cubeBuildResult.total_time === '?' ? '?' : Math.round(cubeBuildResult.total_time)} ms
            </td>
            <td className={'govuk-table__cell'}>
              {dateFormat(cubeBuildResult.start_time, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })}
            </td>
            <td className={'govuk-table__cell'}>
              {dateFormat(cubeBuildResult.finish_time, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })}
            </td>
          </tr>
        </tbody>
      </table>
      {memoryUsage}
      {error}
    </>
  );
}
