/**
 * Return an array with the numbers from 0 to n-1, in a random order
 */
export const getRandomArray = (n) => {
  if (n === 0) return [];
  if (n === 1) return [0];

  const res = getRandomArray(n - 1);
  const next = Math.floor(Math.random() * n);
  res.splice(next, 0, n - 1); // Add n-1 at a random position in the array

  return res;
};

/**
 * Default compareKeys function will work for numbers, strings and dates
 */
export const defaultCompareKeysFunction = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  if (a === b) return 0;

  const err: any = new Error("Couldn't compare elements");
  err.a = a;
  err.b = b;
  throw err;
};

/**
 * Check whether two values are equal (used in non-unique deletion)
 */
export const defaultCheckValueEquality = (a, b) => a === b;
