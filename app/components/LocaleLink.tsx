import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { createSearchParams, Link, useLocation, type LinkProps } from 'react-router';
import { localeUrl } from '~/utils/locale-url';

type LocaleLinkProps = Omit<LinkProps, 'to'> &
  PropsWithChildren<{
    path?: string;
    query?: Record<string, string | string[]>;
    anchor?: string;
  }>;

export const LocaleLink = ({ children, path, query, anchor, ...props }: LocaleLinkProps) => {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  return (
    <Link
      to={localeUrl(
        path || pathname,
        i18n.language,
        query ? createSearchParams(query) : undefined,
        anchor
      )}
      {...props}
    >
      {children}
    </Link>
  );
};
