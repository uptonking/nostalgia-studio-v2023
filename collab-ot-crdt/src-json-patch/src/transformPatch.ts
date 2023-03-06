/*!
 * Based on work from
 * https://github.com/Palindrom/JSONPatchOT
 * (c) 2017 Tomek Wytrebowicz
 *
 * MIT license
 * (c) 2022 Jacob Wright
 *
 *
 * WARNING: using /array/- syntax to indicate the end of the array makes it impossible to transform arrays correctly in
 * all situaions. Please avoid using this syntax when using Operational Transformations.
 */

import type { JSONPatchOpHandlerMap, JSONPatchOp } from './types';
import { log } from './utils/log';
import { runWithObject } from './state';
import { getType } from './utils';
import { getTypes } from './ops';

/**
 * Transform an array of JSON Patch operations against another array of JSON Patch operations. Returns a new array with
 * transformed operations. Operations that change are cloned, making the results of this function immutable.
 * otherOps are transformed over thisOps with thisFirst indicating whether thisOps are considered to have happened
 * first.
 */
export function transformPatch(
  obj: any,
  thisOps: JSONPatchOp[],
  otherOps: JSONPatchOp[],
  custom?: JSONPatchOpHandlerMap,
): JSONPatchOp[] {
  const types = getTypes(custom);
  return runWithObject(obj, types, false, () => {
    return thisOps.reduce((otherOps: JSONPatchOp[], thisOp: JSONPatchOp) => {
      // transform ops with patch operation
      const handler = getType(thisOp)?.transform;
      if (typeof handler === 'function') {
        otherOps = handler(thisOp, otherOps);
      } else {
        log('No function to transform against for', thisOp.op);
      }

      return otherOps;
    }, otherOps);
  });
}
