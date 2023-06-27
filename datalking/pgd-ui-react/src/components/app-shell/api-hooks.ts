import { createContext, useContext } from 'react';

import {
  type Store,
  useStore,
  useStoreProps,
} from '@ariakit/react-core/utils/store';

import { createAppShellStore } from './api-store';
import {
  type AppShellState,
  type AppShellStore,
  type AppShellStoreOptions,
  type AppShellStoreProps,
} from './types';

export const AppShellStoreContext = createContext<AppShellStore | undefined>(
  undefined,
);

export const useAppShellContext = () => {
  const store = useContext(AppShellStoreContext);

  if (!store) {
    throw new Error('useAppShellContext must be used within Provider');
  }

  return store;
};

export function useAppShellStoreOptions(
  _props: AppShellStoreProps,
): Partial<AppShellStoreOptions> {
  return {};
}

export function useAppShellStoreProps<T extends AppShellStore>(
  store: T,
  props: AppShellStoreProps,
) {
  // @ts-expect-error fix-types
  useStoreProps(store, props, 'isSidebarOpen', 'setIsSidebarOpen');
  return store;
}

/**
 * Creates a AppShell store.
 */
export function useAppShellStore(
  props: AppShellStoreProps = {},
): AppShellStore {
  const store = useStore(() => createAppShellStore(props));
  return useAppShellStoreProps(store, props);
}
