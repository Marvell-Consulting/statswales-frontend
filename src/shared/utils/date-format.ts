import { TZDate } from '@date-fns/tz';
import { FormatOptions, DateArg, format } from 'date-fns';
import { cy, enGB } from 'date-fns/locale';

import { Locale } from '../enums/locale';

// override date-fns locale option with our own Locale enum so we don't have to convert it everywhere we use this function
interface DateFormatOptions extends Omit<FormatOptions, 'locale'> {
  locale?: Locale | string;
}

export const dateFormat = (date: DateArg<Date> & {}, formatStr: string, options?: DateFormatOptions): string => {
  const tzDate = new TZDate(date as Date, 'Europe/London');

  const formatOptions: FormatOptions = {
    ...options,
    locale: options?.locale?.includes('cy') ? cy : enGB
  };

  return format(tzDate, formatStr, formatOptions);
};
