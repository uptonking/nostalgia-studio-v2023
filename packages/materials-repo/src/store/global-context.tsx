import * as React from 'react';
import { createContext, useContext, useMemo, useReducer } from 'react';

import {
  GlobalStateType,
  combiningReducer,
  globalInitialState,
} from './global-store';

export type GlobalContextType = {
  state?: GlobalStateType;
  dispatch?: React.Dispatch<any>;
  version?: string;
};
export type GlobalProviderProps = {
  value?: {
    state?: GlobalStateType;
    dispatch?: React.Dispatch<any>;
    version?: string;
  };
  children: JSX.Element;
};

export const GlobalContext = createContext<GlobalContextType | null>(null);

export function GlobalProvider(props: GlobalProviderProps) {
  const { value, children } = props;

  const [state, dispatch] = useReducer(combiningReducer, globalInitialState);

  const ctxVal: GlobalContextType = useMemo(
    () => ({
      version: `1.0.0`,
      state,
      dispatch,
      ...value,
    }),
    [state, value],
  );

  return (
    <GlobalContext.Provider value={ctxVal}>{children}</GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalProvider;
