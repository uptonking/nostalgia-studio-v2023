import crypto from 'node:crypto';

/**
 * Produces a duplicate-free version of the array, using === to test object equality. In particular only the first
 * occurrence of each value is kept. If you want to compute unique items based on a transformation, pass an iteratee
 * function.
 *
 * Heavily inspired by {@link https://underscorejs.org/#uniq}.
 * @param {Array} array
 * @param {IterateeFunction} [iteratee] transformation applied to every element before checking for duplicates. This will not
 * transform the items in the result.
 * @return {Array}
 * @alias module:utils.uniq
 */
export const uniq = (array, iteratee = undefined) => {
  if (iteratee)
    return [...new Map(array.map((x) => [iteratee(x), x])).values()];
  else return [...new Set(array)];
};


/**
 * Returns true if arg is an Object. Note that JavaScript arrays and functions are objects, while (normal) strings
 * and numbers are not.
 *
 * Heavily inspired by {@link https://underscorejs.org/#isObject}.
 * @param {*} arg
 * @return {boolean}
 */
const isObject = (arg) => typeof arg === 'object' && arg !== null;

/**
 * Returns true if d is a Date.
 *
 * Heavily inspired by {@link https://underscorejs.org/#isDate}.
 * @param {*} d
 * @return {boolean}
 * @alias module:utils.isDate
 */
export const isDate = (d) =>
  isObject(d) && Object.prototype.toString.call(d) === '[object Date]';

/**
 * Returns true if re is a RegExp.
 *
 * Heavily inspired by {@link https://underscorejs.org/#isRegExp}.
 * @param {*} re
 * @return {boolean}
 * @alias module:utils.isRegExp
 */
export const isRegExp = (re) =>
  isObject(re) && Object.prototype.toString.call(re) === '[object RegExp]';

/**
* Return a random alphanumerical string of length len
* There is a very small probability (less than 1/1,000,000) for the length to be less than len
* (il the base64 conversion yields too many pluses and slashes) but
* that's not an issue here
* The probability of a collision is extremely small (need 3*10^12 documents to have one chance in a million of a collision)
* See http://en.wikipedia.org/wiki/Birthday_problem
* @param {number} len
* @return {string}
* @alias module:customUtilsNode.uid
*/
export const uid = (len) =>
  crypto
    .randomBytes(Math.ceil(Math.max(8, len * 2)))
    .toString('base64')
    .replace(/[+/]/g, '')
    .slice(0, len);
