import { TZDate } from '@date-fns/tz';
import { FormatOptions, DateArg, format, isValid } from 'date-fns';
import { cy, enGB } from 'date-fns/locale';

import { Locale } from '../enums/locale';

// override date-fns locale option with our own Locale enum so we don't have to convert it everywhere we use this function
interface DateFormatOptions extends Omit<FormatOptions, 'locale'> {
  locale?: Locale | string;
  utc?: boolean;
}

// Returns the raw input (or '') when the value isn't a valid date, so callers can safely pass through
// user-supplied strings (e.g. lookup table values) without crashing the render.
export const dateFormat = (
  date: DateArg<Date> | null | undefined,
  formatStr: string,
  options?: DateFormatOptions
): string => {
  if (date == null || date === '') return '';

  const tzDate = new TZDate(date instanceof Date ? date : new Date(date), options?.utc ? 'UTC' : 'Europe/London');
  if (!isValid(tzDate)) {
    return typeof date === 'string' ? date : '';
  }

  const formatOptions: FormatOptions = {
    ...options,
    locale: options?.locale?.includes('cy') ? cy : enGB
  };

  return format(tzDate, formatStr, formatOptions);
};
