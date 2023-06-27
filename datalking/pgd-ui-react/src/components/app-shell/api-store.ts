import { defaultValue } from '@ariakit/core/utils/misc';
import { createStore } from '@ariakit/core/utils/store';

import {
  type AppShellStore,
  type AppShellStoreProps,
  type AppShellStoreState,
} from './types';

export function createAppShellStore(
  props: AppShellStoreProps = {},
): AppShellStore {
  const syncState = props.store?.getState();
  const initialState: AppShellStoreState = {
    isSidebarOpen: defaultValue(
      props.isSidebarOpen,
      syncState?.isSidebarOpen,
      props.defaultIsSidebarOpen,
      true,
    ),
  };

  const appShellStore = createStore(initialState, props.store);

  return {
    ...appShellStore,
    setIsSidebarOpen: (value) => appShellStore.setState('isSidebarOpen', value),
    toggleSidebar: () => appShellStore.setState('isSidebarOpen', (v) => !v),
    showSidebar: () => appShellStore.setState('isSidebarOpen', true),
    hideSidebar: () => appShellStore.setState('isSidebarOpen', false),
  };
}
