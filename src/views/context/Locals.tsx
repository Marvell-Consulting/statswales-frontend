import React, { createContext, PropsWithChildren, useContext } from 'react';
import { FlashMessage } from '../../interfaces/flash-message';
import { ViewError } from '../../dtos/view-error';

export type Locals = {
  errors?: ViewError[];
  flash?: FlashMessage[] | string[];
} & Record<string, any>;

const Context = createContext<Locals | undefined>(undefined);

export const LocalsProvider = ({ children, ...props }: PropsWithChildren<Locals>) => {
  return <Context.Provider value={props}>{children}</Context.Provider>;
};

export const useLocals = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error(`useLocals must be used within a LocalsProvider`);
  }

  return context;
};
