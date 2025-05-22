import React from 'react';
import { useLocals } from '../context/Locals';

export default function T({ children, raw, className, ...props }) {
  const { t } = useLocals();
  const key = Array.isArray(children) ? children.join('') : children;
  const content = t(key, props);
  if (raw) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <span>{content}</span>;
}
