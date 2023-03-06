import { EMPTY, pluck, pluckWithShallowCopy } from './pluck';
import { toKeys } from './toKeys';

export function getOpData(path: string, createMissingObjects?: boolean) {
  const keys = toKeys(path);
  const lastKey = keys[keys.length - 1];
  let target = pluck(keys);
  if (createMissingObjects) target = target || EMPTY;
  return [keys, lastKey, target];
}
