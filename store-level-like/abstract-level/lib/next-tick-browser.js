import queueMicrotask from 'queue-microtask';

export default function nextTick(fn, ...args) {
  if (args.length === 0) {
    queueMicrotask(fn);
  } else {
    queueMicrotask(() => fn(...args));
  }
}

// module.exports = function (fn, ...args) {
//   if (args.length === 0) {
//     queueMicrotask(fn)
//   } else {
//     queueMicrotask(() => fn(...args))
//   }
// }
