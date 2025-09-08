import React, { ReactNode } from 'react';
import { useLocals } from '../context/Locals';

export type TProps = {
  children: ReactNode;
  fallback?: string;
  raw?: boolean;
  noWrap?: boolean;
  className?: string;
} & Record<string, string | number | boolean | ReactNode>;

export default function T({ children, fallback, className, raw, noWrap, ...props }: TProps) {
  const { t } = useLocals();
  const key = Array.isArray(children) ? children.join('') : children;
  const content = t(key, props);

  if (noWrap) {
    return content; // some elements do not allow nested span elements, e.g. <option>
  }

  if (fallback && content === key) {
    return <span className={className}>{fallback}</span>;
  }

  if (raw) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <span className={className}>{content}</span>;
}
