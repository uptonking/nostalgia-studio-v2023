import { type ReadableAtom } from '../atom/index';
import { type AnyStore, type Store, type StoreValue } from '../map/index';

type StoreValues<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: StoreValue<Stores[Index]>;
};

type A = ReadableAtom<number>;
type B = ReadableAtom<string>;

type C = (...values: StoreValues<[A, B]>) => void;

interface Computed {
  /**
   * Create derived store, which use generates value from another stores.
   *
   * ```js
   * import { computed } from 'nanostores'
   *
   * import { $users } from './users.js'
   *
   * export const $admins = computed($users, users => {
   *   return users.filter(user => user.isAdmin)
   * })
   * ```
   */
  <Value extends any, OriginStores extends AnyStore[]>(
    stores: [...OriginStores],
    cb: (...values: StoreValues<OriginStores>) => Value,
  ): ReadableAtom<Value>;
  <Value extends any, OriginStore extends Store>(
    stores: OriginStore,
    cb: (value: StoreValue<OriginStore>) => Value,
  ): ReadableAtom<Value>;
}

export const computed: Computed;
