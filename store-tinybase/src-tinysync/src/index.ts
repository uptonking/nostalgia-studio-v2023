import { createStore } from 'tinybase';

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

  const setChangesTo = isTestMode ? syncTo.setChanges : syncTo.setChanges1;
  setChangesTo(nextToChanges);
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

// store2.setCell('pets', 'roger', 'color', 'brown');
// store2.setCell('pets', 'roger', 'color', 'red');

// const store3 = createStore();
// const sync3 = createSync(store3, 'store3');
// syncFromTo(sync1, sync3);

// store3.setRow('pets', 'roger', { legs: 4 });
// syncFromTo(sync1, sync3);
// syncFromTo(sync3, sync1);

// --

// const store0 = createStore();
// const sync0 = createSync(store0, 'store0');
// const C = 100;
// store0.transaction(() => {
//   for (let t = 0; t < C; t++) {
//     for (let r = 0; r < C; r++) {
//       for (let c = 0; c < C; c++) {
//         store0.setCell(t + '', r + '', c + '', 1);
//       }
//     }
//   }
// });
// console.log(sync0.getChanges());
// console.log(process.memoryUsage().heapUsed / 1000000);
