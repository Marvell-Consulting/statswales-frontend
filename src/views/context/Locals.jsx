import React, { createContext, useContext } from 'react';

const Context = createContext(null);

export const LocalsProvider = ({ children, ...props }) => {
  return <Context.Provider value={props}>{children}</Context.Provider>;
};

export const useLocals = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error(`useLocals must be used within a LocalsProvider`);
  }

  return context;
};
