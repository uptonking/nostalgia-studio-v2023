import {
  type Store,
  type StoreOptions,
  type StoreProps,
} from '@ariakit/core/utils/store';
import { type SetState } from '@ariakit/core/utils/types';

export type AppShellState = {
  isSidebarOpen?: boolean;
};

export interface AppShellStoreState {
  /**
   * @default true for desktop, false for mobile
   */
  isSidebarOpen?: boolean;

  sidebarElement?: HTMLElement | null;
}

export interface AppShellStoreFunctions<
  T extends AppShellState = AppShellState,
> {
  /**
   * Sets the `isSidebarOpen` state.
   */
  setIsSidebarOpen: SetState<T['isSidebarOpen']>;
  toggleSidebar: () => void;
  showSidebar: () => void;
  hideSidebar: () => void;
}

export interface AppShellStoreOptions<T extends AppShellState = AppShellState>
  extends StoreOptions<AppShellStoreState, 'isSidebarOpen'> {
  /**
   * @default true
   */
  defaultIsSidebarOpen?: AppShellStoreState['isSidebarOpen'];
}

export type AppShellStoreProps<T extends AppShellState = AppShellState> =
  AppShellStoreOptions<T> & StoreProps<AppShellStoreState>;

export type AppShellStore<T extends AppShellState = AppShellState> =
  AppShellStoreFunctions<T> & Store<AppShellStoreState>;
