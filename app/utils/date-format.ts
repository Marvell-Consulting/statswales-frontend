import { TZDate } from '@date-fns/tz';
import { format, type DateArg } from 'date-fns';

import { enGB, cy } from 'date-fns/locale';

export const dateFormat = (date: DateArg<Date> & {}, formatStr: string, options?: any): string => {
  const tzDate = new TZDate(date as Date, 'Europe/London');
  if (options?.locale) {
    options.locale = options.locale.includes('cy') ? cy : enGB;
  }
  return format(tzDate, formatStr, options);
};
