import { promises as fs, constants as fsConstants } from 'node:fs';
import { callbackify, promisify } from 'node:util';

const waterfallAsync = async (tasks) => {
  for (const task of tasks) {
    await promisify(task)();
  }
};

export const waterfall = callbackify(waterfallAsync);

const eachAsync = async (arr, iterator) =>
  Promise.all(arr.map((el) => promisify(iterator)(el)));

export const each = callbackify(eachAsync);

export const apply = function (fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function () {
    return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
  };
};

const whilstAsync = async (test, fn) => {
  while (test()) await promisify(fn)();
};

export const whilst = callbackify(whilstAsync);

export const wait = (delay) =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
export const exists = (path) =>
  fs.access(path, fsConstants.F_OK).then(
    () => true,
    () => false,
  );

export const existsCallback = (path, callback) =>
  fs.access(path, fsConstants.F_OK).then(
    () => callback(true),
    () => callback(false),
  );

export { callbackify };
