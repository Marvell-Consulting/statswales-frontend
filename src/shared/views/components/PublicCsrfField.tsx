import React from 'react';
import { useLocals } from '../context/Locals';

export default function PublicCsrfField() {
  const { publicCsrfToken } = useLocals();
  if (!publicCsrfToken) return null;
  return <input type="hidden" name="_csrf" value={publicCsrfToken} />;
}
