import { type JSONPatchOp } from '../types';
import { getTypeLike } from './getType';
import { isAdd } from './ops';
import { getIndexAndEnd } from './paths';
import { getValue } from './pluck';

/**
 * Adjust ops within an array
 */
export function updateArrayPath(
  otherOp: JSONPatchOp,
  pathName: 'from' | 'path',
  thisPrefix: string,
  thisIndex: number,
  modifier: 1 | -1,
): JSONPatchOp | [JSONPatchOp, JSONPatchOp] | null {
  const path = otherOp[pathName];
  if (!path || !path.startsWith(thisPrefix)) return otherOp;

  const [otherIndex, end] = getIndexAndEnd(path, thisPrefix.length);
  const opLike = getTypeLike(otherOp);

  // A bit of complex logic to handle moves upwards in an array. Since an item is removed earier in the array and added later, the other index is like it was one less (or this index was one more), so we correct it
  if (
    opLike === 'move' &&
    pathName === 'path' &&
    otherOp.from?.startsWith(thisPrefix) &&
    getIndexAndEnd(otherOp.from, thisPrefix.length)[0] < otherIndex
  ) {
    thisIndex -= 1;
  }

  if (otherIndex < thisIndex) return otherOp;

  // When this is a removed item and the op is a subpath or a non-add, remove it.
  if (otherIndex === thisIndex && modifier === -1) {
    if (end === path.length) {
      // If we are adding to the location something got removed, continue adding it.
      if (isAdd(otherOp, pathName)) return otherOp;
      if (otherOp.op === 'replace') return getValue(otherOp, 'op', 'add');
      // If we are replacing an item which was removed, add it (don't replace something else in the array)
      if (opLike === 'replace')
        return [{ op: 'add', path: otherOp.path, value: null }, otherOp];
    }
    return null;
  } else if (
    isAdd(otherOp, pathName) &&
    otherIndex === thisIndex &&
    end === path.length
  ) {
    return otherOp;
  }

  const newPath = thisPrefix + (otherIndex + modifier) + path.slice(end);
  otherOp = getValue(otherOp, pathName, newPath);

  return otherOp;
}
