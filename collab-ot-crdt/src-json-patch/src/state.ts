import { type JSONPatchOpHandlerMap, type Root } from './types';

export let root: Root | null;
export let cache: Set<any> | null;
export let types: JSONPatchOpHandlerMap | null;

export function runWithObject(
  object: any,
  allTypes: JSONPatchOpHandlerMap,
  shouldCache: boolean,
  callback: Function,
) {
  root = { '': object };
  types = allTypes;
  cache = shouldCache ? new Set() : null;
  const result = callback() || root[''];
  root = null;
  types = null;
  cache = null;
  return result;
}
