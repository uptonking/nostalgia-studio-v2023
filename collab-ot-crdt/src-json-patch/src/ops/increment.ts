import { replace } from './replace';
import { type JSONPatchOpHandler } from '../types';
import { get, updateRemovedOps } from '../utils';

/**
 * Custom types should start with an @ symbol, so you can use this in this way:
 * ```js
 * import { increment } from '@json-patch/custom-types/increment';
 *
 * const patch = new JSONPatch([], { '@inc': increment });
 * ```
 *
 * Or you can subclass JSONPatch:
 * ```js
 * class MyJSONPatch extends JSONPatch {
 *   constructor(ops: JSONPatchOp[]) {
 *     super(ops, { '@inc': increment });
 *   }
 *
 *   increment(path: string, value: number) {
 *     return this.op('@inc', path, value);
 *   }
 *
 *   decrement(path: string, value: number) {
 *     return this.op('@inc', path, -value);
 *   }
 * }
 */
export const increment: JSONPatchOpHandler = {
  like: 'replace',

  apply(path, value, _, createMissingObjects) {
    return replace.apply(
      path,
      (get(path) || 0) + value,
      '',
      createMissingObjects,
    );
  },
  transform(thisOp, otherOps) {
    return updateRemovedOps(thisOp.path, otherOps, false, true);
  },
  invert(op, value, changedObj, isIndex) {
    return replace.invert(op, value, changedObj, isIndex);
  },
  compose(value1, value2) {
    return value1 + value2;
  },
};
