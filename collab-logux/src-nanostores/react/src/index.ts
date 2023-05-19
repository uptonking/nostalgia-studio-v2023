import { useCallback, useSyncExternalStore } from 'react';

import { listenKeys, type Store, type StoreValue } from 'nanostores';

import type { UseStoreOptions } from './index.d';

export * from './index.d';

export function useStore<SomeStore extends Store>(
  store: SomeStore,
  opts: UseStoreOptions<SomeStore> = {},
): StoreValue<SomeStore> {
  const sub = useCallback(
    (onChange) =>
      opts.keys
        ? // @ts-expect-error fix-types
          listenKeys(store, opts.keys, onChange)
        : store.listen(onChange),
    [opts.keys, store],
  );

  const get = store.get.bind(store);

  return useSyncExternalStore(sub, get, get);
}
