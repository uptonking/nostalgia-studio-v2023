import { syncFromTo } from '../src';
import { createSync } from '../src/sync';

/** changes ops */
const _messages = [];
/** create tables */
const createStore = (initialState = { movies: [] }) => {
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

const store1 = createStore();
// @ts-expect-error fix-types
const sync1 = createSync(store1, 'store1');
sync1.mockChange();

const store2 = createStore();
// @ts-expect-error fix-types
const sync2 = createSync(store2, 'store2');
sync2.mockChange();

syncFromTo(sync1, sync2, true);
syncFromTo(sync2, sync1, true);

// describe('sync plain object test', () => {
//   test('sync set/update', () => {
//     const _messages = [];
//     const _data = { movies: [] };

//     const hashStr = stringHash('913863d3-3cf7-4fb0-a586-da012bec310a');
//     const hlc1 = encodeHlc(Date.now(), 10, hashStr);
//     // console.log(
//     //   ';; ',
//     //   hashStr,
//     //   hlc1.slice(0, 7),
//     //   hlc1.slice(7, 11),
//     //   hlc1.slice(11),
//     // );

//     expect(hlc1.length).toBe(16);
//   });
// });
