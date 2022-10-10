import * as set from './set';
import * as t from './testing';

/**
 * @template T
 * @param {t.TestCase} tc
 */
export const testFirst = (tc) => {
  const two = set.from(['a', 'b']);
  const one = set.from(['b']);
  const zero = set.create();
  t.assert(set.first(two) === 'a');
  t.assert(set.first(one) === 'b');
  t.assert(set.first(zero) === undefined);
};
