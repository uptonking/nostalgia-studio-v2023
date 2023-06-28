import { createDisclosureStore } from '@ariakit/core/disclosure/disclosure-store';
import { useStore, useStoreProps } from '@ariakit/react-core/utils/store';

import {
  type DisclosureStore,
  type DisclosureStoreOptions,
  type DisclosureStoreProps,
} from './types';

export function useDisclosureStoreOptions(
  _props: DisclosureStoreProps,
): Partial<DisclosureStoreOptions> {
  return {};
}

export function useDisclosureStoreProps<T extends DisclosureStore>(
  store: T,
  props: DisclosureStoreProps,
) {
  useStoreProps(store, props, 'open', 'setOpen');
  useStoreProps(store, props, 'animated');
  return store;
}

/**
 * Creates a disclosure store.
 */
export function useDisclosureStore(
  props: DisclosureStoreProps = {},
): DisclosureStore {
  const options = useDisclosureStoreOptions(props);
  const store = useStore(() => createDisclosureStore({ ...props, ...options }));
  return useDisclosureStoreProps(store, props);
}
