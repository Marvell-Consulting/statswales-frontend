import React from 'react';
import { useLocals } from '../context/Locals';

export default function CsrfField() {
  const { csrfToken } = useLocals();
  return <input type="hidden" name="_csrf" value={csrfToken} />;
}
