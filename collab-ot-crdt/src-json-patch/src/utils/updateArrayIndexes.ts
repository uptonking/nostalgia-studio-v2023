import { type JSONPatchOp } from '../types';
import { mapAndFilterOps, transformRemove } from './ops';
import { log } from './log';
import { getPrefixAndProp } from './paths';
import { updateArrayPath } from './updateArrayPath';
import { getTypeLike } from './getType';

/**
 * Update array indexes to account for values being added or removed from an array.
 */
export function updateArrayIndexes(
  thisPath: string,
  otherOps: JSONPatchOp[],
  modifier: 1 | -1,
  isRemove?: boolean,
): JSONPatchOp[] {
  const [arrayPrefix, indexStr] = getPrefixAndProp(thisPath);
  const index = parseInt(indexStr);

  log('Shifting array indexes', thisPath, modifier);

  // Check ops for any that need to be replaced
  return mapAndFilterOps(otherOps, (op, i, breakAfter) => {
    if (isRemove && thisPath === op.from) {
      const opLike = getTypeLike(op);
      if (opLike === 'move') {
        // We need the rest of the otherOps to be adjusted against this "move"
        breakAfter();
        return transformRemove(op.path, otherOps.slice(i + 1));
      } else if (opLike === 'copy') {
        // We need future ops on the copied object to be removed
        breakAfter();
        let rest = transformRemove(thisPath, otherOps.slice(i + 1));
        rest = transformRemove(op.path, rest);
        return rest;
      }
    }
    // check for items from the same array that will be affected
    op = updateArrayPath(
      op,
      'from',
      arrayPrefix,
      index,
      modifier,
    ) as JSONPatchOp;
    return (
      op &&
      (updateArrayPath(op, 'path', arrayPrefix, index, modifier) as JSONPatchOp)
    );
  });
}
