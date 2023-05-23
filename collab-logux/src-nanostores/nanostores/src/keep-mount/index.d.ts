import { MapTemplate, AnySyncTemplate } from '../deprecated/index';
import { Store } from '../map/index';

/**
 * Prevent destructor call for the store.
 *
 * Together with {@link cleanStores} is useful tool for tests.
 *
 * ```js
 * import { keepMount } from 'nanostores'
 *
 * keepMount(store)
 * ```
 *
 * @param store The store.
 */
export function keepMount(store: Store | MapTemplate | AnySyncTemplate): void;