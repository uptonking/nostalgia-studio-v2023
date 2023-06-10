import { useMemo } from 'react';

import { type UseBoundStore } from 'zustand';
import { type State, type StateSelector, type StoreApi } from 'zustand/vanilla';

export const useZustandStoreSelector = <TState extends State, U>(
  create: () => UseBoundStore<TState, StoreApi<TState>>,
  selector: StateSelector<TState, U>,
  deps: any[],
) => {
  const useStore = useMemo(() => create(), [create, ...deps]);

  return { getState: useStore.getState, state: useStore(selector) };
};
