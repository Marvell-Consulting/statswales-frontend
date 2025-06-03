import { isEmpty } from 'lodash-es';
import { Locale } from '~/enums/locale';

export const localeUrl = (
  path: string,
  locale: Locale | string,
  query?: URLSearchParams,
  anchor?: string
): string => {
  const locales = [Locale.English, Locale.EnglishGb, Locale.Welsh, Locale.WelshGb];
  // console.log({ path, locale, query, anchor });
  // FIXME: get these properly
  // const locales = SUPPORTED_LOCALES as string[];

  const pathElements = path
    .split('/')
    .filter(Boolean) // strip empty elements to avoid trailing slash
    .filter((element) => !locales.includes(element as Locale)); // strip language from the path if present

  // TODO: re-enable path translation once the router knows how to handle it
  // if (![Locale.English, Locale.EnglishGb].includes(locale as Locale)) {
  //     // translate the url path to the new locale
  //     pathElements = pathElements.map((element) => i18next.t(`routes.${element}`, { lng: locale }));
  // }

  const newPath = isEmpty(pathElements) ? '' : `/${pathElements.join('/')}`;
  const queryString = !query?.size ? '' : `?${query}`;
  const anchorString = isEmpty(anchor) ? '' : `#${anchor}`;
  return `/${locale}${newPath}${queryString}${anchorString}`;
};
