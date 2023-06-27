import { createContext } from 'react';

import {
  type Store,
  useStore,
  useStoreProps,
} from '@ariakit/react-core/utils/store';

import * as Core from './api-store';

export const SwitchStoreContext = createContext(false);

export function useSwitchStoreOptions(
  _props: SwitchStoreProps,
): Partial<SwitchStoreOptions> {
  return {};
}

export function useSwitchStoreProps<T extends SwitchStore>(
  store: T,
  props: SwitchStoreProps,
) {
  useStoreProps(store, props, 'value', 'setValue');
  return store;
}

/**
 * Creates a Switch store.
 * @example
 * ```jsx
 * const switch = useSwitchStore({ defaultValue: true });
 * <Switch store={switch} />
 * ```
 */
export function useSwitchStore(props?: SwitchStoreProps): SwitchStore;

export function useSwitchStore(props: SwitchStoreProps = {}): SwitchStore {
  const store = useStore(() => Core.createSwitchStore(props));
  return useSwitchStoreProps(store, props);
}

export type SwitchStoreValue = Core.SwitchStoreValue;

type Value = Core.SwitchStoreValue;
export type SwitchStoreState<T extends Value = Value> =
  Core.SwitchStoreState<T>;

export type SwitchStoreFunctions<T extends Value = Value> =
  Core.SwitchStoreFunctions<T>;

export interface SwitchStoreOptions<T extends Value = Value>
  extends Core.SwitchStoreOptions<T> {
  /**
   * A callback that gets called when the `value` state changes.
   * @param value The new value.
   * @example
   * function MySwitch({ value, onChange }) {
   *   const Switch = useSwitchStore({ value, setValue: onChange });
   * }
   */
  setValue?: (value: SwitchStoreState<T>['value']) => void;
}

export interface SwitchStoreProps<T extends Value = Value>
  extends SwitchStoreOptions<T>,
    Core.SwitchStoreProps<T> {}

export interface SwitchStore<T extends Value = Value>
  extends SwitchStoreFunctions<T>,
    Store<Core.SwitchStore<T>> {}
