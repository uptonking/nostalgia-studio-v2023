import { defaultValue } from '@ariakit/core/utils/misc';
import {
  createStore,
  type Store,
  type StoreOptions,
  type StoreProps,
} from '@ariakit/core/utils/store';
import {
  type PickRequired,
  type SetState,
  type ToPrimitive,
} from '@ariakit/core/utils/types';

type Value = boolean | string | number | Array<string | number>;

export function createSwitchStore(props: SwitchStoreProps = {}): SwitchStore {
  const syncState = props.store?.getState();
  const initialState: SwitchStoreState = {
    value: defaultValue(
      props.value,
      syncState?.value,
      props.defaultValue,
      false,
    ),
  };

  const switchStore = createStore(initialState, props.store);
  return {
    ...switchStore,
    setValue: (value) => switchStore.setState('value', value),
  };
}

export type SwitchStoreValue = Value;

export interface SwitchStoreState<T extends Value = Value> {
  /**
   * The checked state of the switch.
   */
  value: ToPrimitive<T>;
}

export interface SwitchStoreFunctions<T extends Value = Value> {
  /**
   * Sets the `value` state.
   * @example
   * store.setValue(true);
   * store.setValue((value) => !value);
   */
  setValue: SetState<SwitchStoreState<T>['value']>;
}

export interface SwitchStoreOptions<T extends Value = Value>
  extends StoreOptions<SwitchStoreState<T>, 'value'> {
  /**
   * The default value of the switch.
   *
   * @default false
   */
  defaultValue?: SwitchStoreState<T>['value'];
}

export type SwitchStoreProps<T extends Value = Value> = SwitchStoreOptions<T> &
  StoreProps<SwitchStoreState<T>>;

export type SwitchStore<T extends Value = Value> = SwitchStoreFunctions<T> &
  Store<SwitchStoreState<T>>;
