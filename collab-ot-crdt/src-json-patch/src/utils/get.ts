import { getOpData } from './getOpData';

export function get(path: string) {
  // eslint-disable-next-line no-unused-vars
  const [keys, lastKey, target] = getOpData(path);
  return target ? target[lastKey] : undefined;
}
