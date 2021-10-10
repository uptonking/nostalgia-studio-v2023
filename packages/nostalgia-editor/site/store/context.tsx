import * as React from 'react';
import { createContext, useMemo } from 'react';

export const NotesAppContext = createContext(null);

export function NotesAppProvider(props) {
  const { value, children } = props;

  const ctxVal = useMemo(
    () => ({
      version: `1.0.0`,
      ...value,
    }),
    [value],
  );

  return (
    <NotesAppContext.Provider value={ctxVal}>
      {children}
    </NotesAppContext.Provider>
  );
}
