import React from 'react';
import T from '../T';
import { parse } from 'date-fns';

import { dateFormat } from '../../../utils/date-format';
import { NextUpdateType } from '../../../enums/next-update-type';
import { useLocals } from '../../context/Locals';

type NextUpdateAt = {
  update_type: NextUpdateType;
  date?: {
    day?: string;
    month?: string;
    year?: string;
  };
};

type NextUpdateProps = {
  datasetMetadata?: {
    keyInfo?: {
      nextUpdateAt?: NextUpdateAt;
    };
  };
};

const getNextUpdate = (nextUpdateAt?: NextUpdateAt) => {
  const { i18n } = useLocals();

  if (!nextUpdateAt?.update_type) {
    return <T>dataset_view.key_information.next_update_missing</T>;
  }

  switch (nextUpdateAt.update_type) {
    case NextUpdateType.Update: {
      const { day, month, year } = nextUpdateAt.date || {};
      const date = parse(`${day || '01'} ${month || '01'} ${year}`, 'dd MM yyyy', new Date());

      if (day && month && year) {
        return dateFormat(date, 'd MMMM yyyy', { locale: i18n.language });
      } else if (month && year) {
        return dateFormat(date, 'MMMM yyyy', { locale: i18n.language });
      } else {
        return dateFormat(date, 'yyyy', { locale: i18n.language });
      }
    }

    case NextUpdateType.Replacement:
      return <T>dataset_view.key_information.next_update_replacement</T>;

    case NextUpdateType.None:
      return <T>dataset_view.key_information.next_update_none</T>;
  }
};

export function NextUpdate(props: NextUpdateProps) {
  const nextUpdate = getNextUpdate(props.datasetMetadata?.keyInfo?.nextUpdateAt);

  return (
    <p>
      <strong>
        <T>dataset_view.key_information.next_update</T>:
      </strong>
      <span className="govuk-!-margin-left-2">{nextUpdate}</span>
    </p>
  );
}
