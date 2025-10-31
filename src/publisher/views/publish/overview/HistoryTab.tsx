import React from 'react';

import { EventLogDTO } from '../../../../shared/dtos/event-log';
import { TaskDTO } from '../../../../shared/dtos/task';
import T from '../../../../shared/views/components/T';
import Table from '../../../../shared/views/components/Table';
import { useLocals } from '../../../../shared/views/context/Locals';
import { dateFormat } from '../../../../shared/utils/date-format';

type HistoryTabProps = {
  history: EventLogDTO[];
};

export function HistoryTab({ history }: HistoryTabProps) {
  const { i18n } = useLocals();

  const columns = [
    {
      key: 'created_at' as keyof EventLogDTO,
      label: <T>publish.overview.history.table.created_at</T>,
      format: (createdAt: Date, event: EventLogDTO) => {
        return (
          <span data-eventid={event.id}>
            {dateFormat(createdAt, 'h:mmaaa, d MMMM yyyy', { locale: i18n.language })}
          </span>
        );
      }
    },
    {
      key: 'action' as keyof EventLogDTO,
      label: <T>publish.overview.history.table.action</T>,
      format: (action: string, event: EventLogDTO) => {
        if (event.entity === 'dataset') {
          return <T>publish.overview.history.event.dataset.{action}</T>;
        }

        if (event.entity === 'revision') {
          return <T>publish.overview.history.event.revision.{action}</T>;
        }

        if (event.entity === 'task') {
          const { action, status, isUpdate } = event.data as TaskDTO;

          if (action === 'publish') {
            return <T>publish.overview.history.event.task.publish.{isUpdate ? `update_${status}` : status}</T>;
          }

          return <T>{`publish.overview.history.event.task.${action}.${status}`}</T>;
        }
      }
    },
    {
      key: 'created_by' as keyof EventLogDTO,
      label: <T>publish.overview.history.table.user</T>,
      format: (createdBy: string) => {
        return createdBy === 'system' ? <T>publish.overview.history.event.created_by.system</T> : createdBy;
      }
    },
    {
      key: 'comment' as keyof EventLogDTO,
      label: <T>publish.overview.history.table.comment</T>,
      format: (value: string, event: EventLogDTO) => {
        if (event.entity === 'task') {
          return event.data?.comment;
        }
      }
    }
  ];

  return <Table<EventLogDTO> columns={columns} rows={history} />;
}
