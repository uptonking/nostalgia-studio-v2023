import { root } from '../state';
import { getOpData } from './getOpData';

const arrayPathExp = /\/(0|[1-9]\d*)$/;
const EMPTY: any = [];

export function getPrefix(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  return path.slice(0, lastSlash + 1);
}

export function getProp(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  return path.slice(lastSlash + 1);
}

export function getPrefixAndProp(path: string): [string, string] {
  const prefix = getPrefix(path);
  return [prefix, path.slice(prefix.length)];
}

export function getPropAfter(path: string, index: number): string {
  const lastSlash = path.indexOf('/', index);
  return path.slice(index, lastSlash === -1 ? undefined : lastSlash);
}

export function isArrayPath(path: string) {
  if (!arrayPathExp.test(path)) return false;
  if (!root || !root['']) return true;
  const [_, __, target] = getOpData(path);
  return Array.isArray(target);
}

export function getArrayPrefixAndIndex(
  path: string,
  pathLength?: number,
): [string, number] {
  if (pathLength) path = path.slice(0, path.indexOf('/', pathLength));
  if (!arrayPathExp.test(path)) return EMPTY;
  const [_, __, target] = getOpData(path);
  if (!Array.isArray(target)) return EMPTY;
  const [prefix, indexStr] = getPrefixAndProp(path);
  const index = parseInt(indexStr);
  return [prefix, index];
}

export function getArrayIndex(path: string, pathLength?: number): number {
  return getArrayPrefixAndIndex(path, pathLength)[1];
}

export function getIndexAndEnd(path: string | undefined, maxLength: number) {
  if (!path) return [];
  const prop = getPropAfter(path, maxLength);
  const end = maxLength + prop.length;
  if (!isArrayPath(path.slice(0, end))) return [];
  const index = parseInt(prop);
  return [index, end];
}
