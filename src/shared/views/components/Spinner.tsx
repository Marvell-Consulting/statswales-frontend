import React, { CSSProperties } from 'react';

export const Spinner = (style?: CSSProperties) => {
  return <div className="loader" aria-live="polite" role="status" style={style}></div>;
};
