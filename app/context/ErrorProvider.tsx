import { createContext, useContext, type PropsWithChildren } from 'react';
import type { ViewError } from '~/dtos/view-error';

const Context = createContext<ViewError[] | null>(null);

export const ErrorProvider = ({
  children,
  errors
}: PropsWithChildren<{ errors?: ViewError[] }>) => {
  return <Context.Provider value={errors ?? null}>{children}</Context.Provider>;
};

export const useErrors = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useErrors be used in an ErrorProvider');
  }

  return context;
};
