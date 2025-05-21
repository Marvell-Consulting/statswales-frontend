import React from 'react';
import { useLocals } from '../context/Locals';

export default function T({ children, raw, ...props }) {
  const { t } = useLocals();
  const key = Array.isArray(children) ? children.join('') : children;
  const content = t(key, props);
  if (raw) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <span>{content}</span>;
}
