import { root, cache } from '../state';
import { shallowCopy } from './shallowCopy';

export const EMPTY = {};

export function pluck(keys: string[]) {
  let object: any = root;
  for (let i = 0, imax = keys.length - 1; i < imax; i++) {
    const key = keys[i];
    if (!object[key]) {
      return null;
    }
    object = object[key];
  }
  return object;
}

export function pluckWithShallowCopy(
  keys: string[],
  createMissingObjects?: boolean,
) {
  let object: any = root;
  for (let i = 0, imax = keys.length - 1; i < imax; i++) {
    const key = keys[i];
    object = object[key] =
      createMissingObjects && !object[key]
        ? getValue(EMPTY)
        : getValue(object[key]);
  }
  return object;
}

export function getValue(value: any, addKey?: string, addValue?: any) {
  if (!cache?.has(value)) {
    value = shallowCopy(value);
    cache?.add(value);
  }
  if (addKey) value[addKey] = addValue;
  return value;
}
