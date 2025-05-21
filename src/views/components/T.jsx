import React from 'react';
import { useLocals } from '../context/Locals';

export default function T({ children, ...props }) {
  const { t } = useLocals();
  return <span dangerouslySetInnerHTML={{ __html: t(children, props) }} />;
}
