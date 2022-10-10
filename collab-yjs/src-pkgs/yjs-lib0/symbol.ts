/**
 * Utility module to work with EcmaScript Symbols.
 *
 * @module symbol
 */

/**
 * Return fresh symbol.
 *
 * @return {Symbol}
 */
export const create = Symbol;

/**
 * @param {any} s
 * @return {boolean}
 */
export const isSymbol = (s) => typeof s === 'symbol';
