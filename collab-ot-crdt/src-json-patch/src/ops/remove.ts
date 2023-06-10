import { type JSONPatchOp, type JSONPatchOpHandler } from '../types';
import {
  getPrefixAndProp,
  isArrayPath,
  log,
  mapAndFilterOps,
  transformRemove,
  updateArrayIndexes,
  updateArrayPath,
  updateRemovedOps,
} from '../utils';
import { getOpData } from '../utils/getOpData';
import { pluckWithShallowCopy } from '../utils/pluck';
import { toArrayIndex } from '../utils/toArrayIndex';

export const remove: JSONPatchOpHandler = {
  like: 'remove',

  apply(path: string, value, _, createMissingObjects) {
    const [keys, lastKey, target] = getOpData(path);

    if (target === null) {
      if (createMissingObjects) return;
      return `[op:remove] path not found: ${path}`;
    }

    if (Array.isArray(target)) {
      const index = toArrayIndex(target, lastKey);
      if (target.length <= index) {
        return '[op:remove] invalid array index: ' + path;
      }
      pluckWithShallowCopy(keys).splice(index, 1);
    } else {
      delete pluckWithShallowCopy(keys)[lastKey];
    }
  },

  invert({ path }, value) {
    return { op: 'add', path, value };
  },

  transform(thisOp, otherOps) {
    log('Transforming', otherOps, 'against "remove"', thisOp);
    return transformRemove(thisOp.path, otherOps, true);

    // let changed = false;
    // const mapped: JSONPatchOp[] = [];

    // for (let i = 0; i < otherOps.length; i++) {
    //   const original = otherOps[i];
    //   // If an op was copied or moved to the same path, it is a no-op and should be removed
    //   if (original.from === original.path) {
    //     if (!changed) changed = true;
    //     continue;
    //   }
    //   let value = iterator(original);
    //   if (value && !Array.isArray(value) && value.from === value.path) value = null;
    //   if (!changed && value !== original) changed = true;
    //   if (Array.isArray(value)) mapped.push(...value);
    //   else if (value) mapped.push(value);
    // }

    // return mapAndFilterOps(otherOps, op => {
    //   if (isArrayPath(op.path)) {
    //     const [ arrayPrefix, indexStr ] = getPrefixAndProp(thisOp.path);
    //     const index = parseInt(indexStr);
    //     op = updateArrayPath(op, 'from', arrayPrefix, index, -1) as JSONPatchOp;
    //     return op && updateArrayPath(op, 'path', arrayPrefix, index, 1) as JSONPatchOp;
    //   } else {
    //     return updateRemovedOp(thisOp.path, op);
    //   }
    // });
  },
};
