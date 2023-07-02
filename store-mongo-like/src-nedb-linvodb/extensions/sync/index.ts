import { type createSync } from './sync';

type SyncUtil = ReturnType<typeof createSync>;

/**
 * 根据双方提供的同步相关api，将from.store中必要的changes同步到to.store
 * @param syncFrom 只需要提供getChanges
 * @param syncTo 需要getChanges+setChanges
 */
export const syncFromTo = <T extends SyncUtil>(
  syncFrom: T,
  syncTo: T,
  isTestMode = false,
) => {
  console.log(
    `\n;;SYNC from ${syncFrom.getUniqueStoreId()} to ${syncTo.getUniqueStoreId()}`,
  );
  console.log(
    ';;OLD/to-tbl',
    isTestMode ? syncTo.getStore() : syncTo.getStore().getTables(),
  );

  const currentToChanges = syncTo.getChanges();
  // console.log(`;;REQ/to-chg ${syncTo.getUniqueStoreId()}`, currentToChanges);

  const nextToChanges = syncFrom.getChanges(currentToChanges);
  // console.log(`;;RES/from-chg ${syncFrom.getUniqueStoreId()}`, nextToChanges);

  const setChanges = isTestMode ? syncTo.setChanges : syncTo.setChanges1;
  setChanges(nextToChanges);
  console.log(
    ';;NEW/to-tbl',
    isTestMode ? syncTo.getStore() : syncTo.getStore().getTables(),
  );
};

// const store1 = createStore();
// const sync1 = createSync(store1, 'store1');
// store1.setCell('pets', 'roger', 'species', 'cat');
// // console.log(';; store1, ', store1['dat']);
// const store2 = createStore();
// const sync2 = createSync(store2, 'store2');
// store2.setCell('pets', 'roger1', 'price', 3);
// syncFromTo(sync1, sync2);
// syncFromTo(sync2, sync1);

export const createStore = (initialState = { movies: [] }) => {
  let state = initialState;
  const listeners: Function[] = [];
  const getState = () => state;
  const setState = (s) => {
    state = s;
    listeners.forEach((fn) => fn());
  };
  const subscribe = (fn) => {
    listeners.push(fn);
    return () => {
      const index = listeners.indexOf(fn);
      listeners.splice(index, 1);
    };
  };
  return { getState, setState, subscribe };
};
