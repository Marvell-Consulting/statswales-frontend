import { useTranslation } from 'react-i18next';
import { NavLink as BaseNavLink, type NavLinkProps } from 'react-router';
import { localeUrl } from '~/utils/locale-url';

export const NavLink = ({ children, to, ...props }: NavLinkProps) => {
  const { i18n } = useTranslation();
  return (
    <BaseNavLink to={localeUrl(to as string, i18n.language)} {...props}>
      {children}
    </BaseNavLink>
  );
};
