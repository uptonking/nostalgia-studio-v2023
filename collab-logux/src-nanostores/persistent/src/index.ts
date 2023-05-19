import {
  atom,
  map,
  type MapStore,
  onMount,
  type WritableAtom,
} from 'nanostores';

import type {
  PersistentEncoder,
  PersistentEvent,
  PersistentEvents,
  PersistentListener,
  PersistentOptions,
  PersistentSimpleOptions,
  PersistentStore,
} from './index.d';

export * from './index.d';

const identity = (a) => a;
let storageEngine: PersistentStore = {};
let eventsEngine: PersistentEvents = {
  addEventListener() {},
  removeEventListener() {},
};

function testSupport() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    /* c8 ignore next 3 */
    // In Privacy Mode access to localStorage will return error
    return false;
  }
}
if (testSupport()) {
  storageEngine = localStorage;
}

export const windowPersistentEvents: PersistentEvents = {
  addEventListener(key, listener) {
    window.addEventListener('storage', listener);
  },
  removeEventListener(key, listener) {
    window.removeEventListener('storage', listener);
  },
};

if (typeof window !== 'undefined') {
  eventsEngine = windowPersistentEvents;
}

export function setPersistentEngine(
  storage: PersistentStore,
  events: PersistentEvents,
) {
  storageEngine = storage;
  eventsEngine = events;
}

/**
 * Store a value in localStorage.
 *
 * For key-value objects use {@link persistentMap}.
 *
 * ```ts
 * import { persistentAtom } from '@nanostores/persistent'
 *
 * export const locale = persistentAtom<string>('locale', 'en')
 * ```
 *
 * @param name Key name in localStorage.
 * @param initial Initial value on missed data in localStorage.
 * @param opts Store options.
 * @return The store.
 */
export function persistentAtom<Value>(
  name: string,
  initial: Value = undefined,
  opts: PersistentSimpleOptions & PersistentEncoder = {} as any,
): WritableAtom<Value> {
  const encode = opts.encode || identity;
  const decode = opts.decode || identity;

  const store = atom(initial);

  const set = store.set;
  store.set = (newValue) => {
    if (typeof newValue === 'undefined') {
      delete storageEngine[name];
    } else {
      storageEngine[name] = encode(newValue);
    }
    set(newValue);
  };

  function listener(e) {
    if (e.key === name) {
      if (e.newValue === null) {
        set(undefined);
      } else {
        set(decode(e.newValue));
      }
    } else if (!storageEngine[name]) {
      set(undefined);
    }
  }

  onMount(store, () => {
    store.set(storageEngine[name] ? decode(storageEngine[name]) : initial);
    if (opts.listen !== false) {
      eventsEngine.addEventListener(name, listener);
      return () => {
        eventsEngine.removeEventListener(name, listener);
      };
    }
  });

  return store;
}

/**
 * Keep key-value data in localStorage.
 *
 * ```ts
 * import { persistentMap } from '@nanostores/persistent'
 *
 * export const settings = persistentMap<{
 *   theme: 'dark' | 'light'
 *   favorite: string
 * }>('settings:', { theme: 'light' })
 * ```
 *
 * @param prefix Key prefix in localStorage.
 * @param initial Initial value on missed data in localStorage.
 * @param opts Store options.
 * @return The store.
 */
export function persistentMap<Value extends object>(
  prefix: string,
  initial: Value = {} as Value,
  opts: PersistentSimpleOptions &
    PersistentEncoder<Value[keyof Value]> = {} as any,
): MapStore<Value> {
  const encode = opts.encode || identity;
  const decode = opts.decode || identity;

  const store: MapStore<Value> = map();

  const setKey = store.setKey;
  store.setKey = (key, newValue) => {
    if (typeof newValue === 'undefined') {
      if (opts.listen !== false && eventsEngine.perKey) {
        // @ts-expect-error fix-types
        eventsEngine.removeEventListener(prefix + key, listener);
      }
      // @ts-expect-error fix-types
      delete storageEngine[prefix + key];
    } else {
      if (
        opts.listen !== false &&
        eventsEngine.perKey &&
        !(key in store['value'])
      ) {
        // @ts-expect-error fix-types
        eventsEngine.addEventListener(prefix + key, listener);
      }
      // @ts-expect-error fix-types
      storageEngine[prefix + key] = encode(newValue);
    }
    setKey(key, newValue);
  };

  const set = store.set;
  store.set = function (newObject) {
    for (const key in newObject) {
      // @ts-ignore
      store.setKey(key, newObject[key]);
    }
    for (const key in store['value']) {
      if (!(key in newObject)) {
        // @ts-expect-error fix-types
        store.setKey(key);
      }
    }
  };

  function listener(e) {
    if (!e.key) {
      set({} as Value);
    } else if (e.key.startsWith(prefix)) {
      if (e.newValue === null) {
        setKey(e.key.slice(prefix.length), undefined);
      } else {
        setKey(e.key.slice(prefix.length), decode(e.newValue));
      }
    }
  }

  onMount(store, () => {
    const data = { ...initial };
    for (const key in storageEngine) {
      if (key.startsWith(prefix)) {
        data[key.slice(prefix.length)] = decode(storageEngine[key]);
      }
    }
    store.set(data);
    if (opts.listen !== false) {
      eventsEngine.addEventListener(prefix, listener);
      return () => {
        eventsEngine.removeEventListener(prefix, listener);
        for (const key in store['value']) {
          eventsEngine.removeEventListener(prefix + key, listener);
        }
      };
    }
  });

  return store;
}

const testStorage = {};
let testListeners = [];

export function useTestStorageEngine() {
  setPersistentEngine(testStorage, {
    addEventListener(key, cb) {
      testListeners.push(cb);
    },
    removeEventListener(key, cb) {
      testListeners = testListeners.filter((i) => i !== cb);
    },
  });
}

export function setTestStorageKey(key, newValue) {
  if (typeof newValue === 'undefined') {
    delete testStorage[key];
  } else {
    testStorage[key] = newValue;
  }
  const event = { key, newValue };
  for (const listener of testListeners) {
    listener(event);
  }
}

export function getTestStorage() {
  return testStorage;
}

export function cleanTestStorage() {
  for (const i in testStorage) {
    setTestStorageKey(i, undefined);
  }
}
