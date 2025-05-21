import React from 'react';
import { useLocals } from '../context/Locals';

export default function T({ children, raw, ...props }) {
  const { t } = useLocals();
  const content = t(children, props);
  if (raw) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <span>{content}</span>;
}
