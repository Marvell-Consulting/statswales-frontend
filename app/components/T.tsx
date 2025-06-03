import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type TProps = {
  children: string | string[];
  fallback?: string;
  raw?: boolean;
  className?: string;
} & Record<string, string | number | boolean | ReactNode>;

export default function T({ children, fallback, className, raw, ...props }: TProps) {
  const { t } = useTranslation();
  const key = Array.isArray(children) ? children.join('') : children;
  const content = t(key, props);

  if (fallback && content === key) {
    return <span className={className}>{fallback}</span>;
  }

  if (raw) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <span className={className}>{content}</span>;
}
