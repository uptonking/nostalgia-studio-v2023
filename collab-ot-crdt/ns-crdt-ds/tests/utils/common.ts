import { inspect } from 'util';

export const debug = (obj: unknown): void => {
  console.log(inspect(obj, false, 6));
};

export const range = (start: number, end: number): number[] => {
  return Array(end - start + 1)
    .fill(1)
    .map((_, idx) => start + idx);
};
