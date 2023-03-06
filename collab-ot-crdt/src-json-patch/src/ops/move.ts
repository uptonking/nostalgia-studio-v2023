import type { JSONPatchOp, JSONPatchOpHandler } from '../types';
import { add } from './add';
import { getValue, pluckWithShallowCopy } from '../utils/pluck';
import { toArrayIndex } from '../utils/toArrayIndex';
import { getOpData } from '../utils/getOpData';
import {
  getArrayIndex,
  getArrayPrefixAndIndex,
  getIndexAndEnd,
  getPrefix,
  getProp,
  getPropAfter,
  getTypeLike,
  isAdd,
  isArrayPath,
  log,
  mapAndFilterOps,
  updateArrayIndexes,
  updateRemovedOps,
} from '../utils';
import { remove } from './remove';

export const move: JSONPatchOpHandler = {
  like: 'move',

  apply(path, value, from: string, createMissingObjects) {
    if (path === from) return;
    const [keys, lastKey, target] = getOpData(from);

    if (target === null) {
      return `[op:move] path not found: ${from}`;
    }

    if (Array.isArray(target)) {
      const index = toArrayIndex(target, lastKey);
      if (target.length <= index) {
        return `[op:move] invalid array index: ${path}`;
      }
      value = target[index];
      pluckWithShallowCopy(keys, createMissingObjects).splice(index, 1);
    } else {
      value = target[lastKey];
      delete pluckWithShallowCopy(keys, createMissingObjects)[lastKey];
    }

    return add.apply(path, value, '', createMissingObjects);
  },

  invert({ path, from }) {
    return { op: 'move', from: path, path: '' + from };
  },

  transform(thisOp, otherOps) {
    log('Transforming', otherOps, 'against "move"', thisOp);
    let removed = false;
    const { from, path } = thisOp as { from: string; path: string };
    if (from === path) return otherOps;

    const [fromPrefix, fromIndex] = getArrayPrefixAndIndex(from);
    const [pathPrefix, pathIndex] = getArrayPrefixAndIndex(path);
    const isPathArray = pathPrefix !== undefined;
    const isSameArray = isPathArray && pathPrefix === fromPrefix;

    /*
    A move needs to do a "remove" and an "add" at once with `from` and `path`. If it is being moved from one location in
    an array to another in the same array, this needs to be handled special.

    1. Ops that were added to where the move lands when not an array should be removed just like with an add/copy
    2. Ops that were added to where the move came from should be translated to the new path
    3. Ops that are in an array with the moved item after need to be adjusted up or down
      3a. But, ops that were translated to the new path shouldn't get adjusted up or down by these adjustments
    */

    // A move removes the value from one place then adds it to another, update the paths and add a marker to them so
    // they won't be altered by `updateArrayIndexes`, then remove the markers afterwards
    otherOps = mapAndFilterOps(otherOps, (otherOp) => {
      if (removed) {
        return otherOp;
      }
      const opLike = getTypeLike(otherOp);
      if (opLike === 'remove' && from === otherOp.path) {
        // Once an operation removes the moved value, the following ops should be working on the old location and not
        // not the new one. Allow the following operations (which may include add/remove) to affect the old location
        removed = true;
      }
      const original = otherOp;
      otherOp = updateMovePath(otherOp, 'path', from, path, original);
      otherOp = updateMovePath(otherOp, 'from', from, path, original);
      return otherOp;
    });

    // Remove/adjust items that were affected by this item moving (those that actually moved because of it will not
    // be affected because they have a temporary $ marker prefix that will keep them from doing so)
    if (isSameArray) {
      // need special logic when a move is within one array
      otherOps = updateArrayIndexesForMove(
        fromPrefix,
        fromIndex,
        pathIndex,
        otherOps,
      );
    } else {
      // if a move is not within one array, treat it as a remove then add
      if (isArrayPath(from)) {
        otherOps = updateArrayIndexes(from, otherOps, -1);
      } else {
        otherOps = updateRemovedOps(from, otherOps);
      }

      if (isArrayPath(path)) {
        otherOps = updateArrayIndexes(path, otherOps, 1);
      } else {
        otherOps = updateRemovedOps(path, otherOps);
      }
    }

    // Remove the move markers added with `updateMovePath`
    return mapAndFilterOps(otherOps, removeMoveMarkers);
  },
};

/**
 * Update paths for a move operation, adding a marker so the path will not be altered by array updates.
 */
function updateMovePath(
  op: JSONPatchOp,
  pathName: 'from' | 'path',
  from: string,
  to: string,
  original: JSONPatchOp,
): JSONPatchOp {
  const path = op[pathName];
  if (!path) return op; // No adjustment needed on a property that doesn't exist

  // If a value is being added or copied to the old location it should not be adjusted
  if (isAdd(op, pathName) && op.path === from) {
    return op;
  }

  // If this path needs to be changed due to a move operation, change it, but prefix it with a $ temporarily so when we
  // adjust the array indexes to account for this change, we aren't changing this path we JUST set. We will remove the
  // $ prefix right after we adjust arrays affected by this move.
  if (path === from || path.indexOf(from + '/') === 0) {
    if (op === original) op = Object.assign({}, op);
    log('Moving', op, 'from', from, 'to', to);
    // Add a marker "$" so this path will not be double-updated by array index updates
    op[pathName] = '$' + path.replace(from, to);
  }

  return op;
}

/**
 * Update array indexes to account for values being added or removed from an array. If the path is not an array index
 * or if nothing is changed then the original array is returned.
 */
function updateArrayIndexesForMove(
  prefix: string,
  fromIndex: number,
  pathIndex: number,
  otherOps: JSONPatchOp[],
) {
  // Check ops for any that need to be replaced
  log(
    `Shifting array indexes for a move between ${prefix}/${fromIndex} and ${prefix}/${pathIndex}`,
  );

  return mapAndFilterOps(otherOps, (otherOp) => {
    // check for items from the same array that will be affected
    const fromUpdate = updateArrayPathForMove(
      otherOp,
      'from',
      prefix,
      fromIndex,
      pathIndex,
    );
    const pathUpdate = updateArrayPathForMove(
      otherOp,
      'path',
      prefix,
      fromIndex,
      pathIndex,
    );
    if (!fromUpdate || !pathUpdate) return null;
    if (fromUpdate !== otherOp || pathUpdate !== otherOp) {
      otherOp = { ...otherOp, path: pathUpdate.path };
      if (fromUpdate.from) otherOp.from = fromUpdate.from;
    }
    return otherOp;
  });
}

/**
 * Get the adjusted path if it is higher, or undefined if not.
 */
function updateArrayPathForMove(
  otherOp: JSONPatchOp,
  pathName: 'from' | 'path',
  prefix: string,
  from: number,
  to: number,
): JSONPatchOp {
  const path = otherOp[pathName];
  if (!path || !path.startsWith(prefix)) return otherOp;

  const min = Math.min(from, to);
  const max = Math.max(from, to);
  const [otherIndex, end] = getIndexAndEnd(path, prefix.length);
  if (otherIndex === undefined) return otherOp; // if a prop on an array is being set, for e.g.
  const isFinalProp = end === path.length;
  const opLike = getTypeLike(otherOp);

  // If this index is not within the movement boundary, don't touch it
  if (otherIndex < min || otherIndex > max) {
    return otherOp;
  }

  // If the index touches the boundary on an unaffected side, don't touch it
  if (isFinalProp && isAdd(otherOp, pathName)) {
    /*
      if the move is from low to high (min is a remove, max is an add) then
      use the remove logic with an add

      if the move is from high to low (min is an add, max is a remove) then
      use the add logic at the bottom
    */
    if (otherIndex === min) {
      if (min === from) {
        // treat like a remove
        return otherOp;
      } else {
        // treat like an add
        return otherOp;
      }
    } else if (otherIndex === max) {
      if (max === from) {
        // treat like a remove
        const fromIndex = getIndexAndEnd(otherOp.from, prefix.length)[0];
        if (
          opLike === 'move' &&
          pathName === 'path' &&
          to <= fromIndex &&
          fromIndex < from
        )
          return otherOp;
        // continue
      } else {
        // treat like an add
        return otherOp;
      }
    }
  }

  const modifier = from === min ? -1 : 1;
  const newPath = prefix + (otherIndex + modifier) + path.slice(end);
  return getValue(otherOp, pathName, newPath);
}

/**
 * Remove any move markers placed during updateMovePath. This occurs in-place since these objects have already been
 * cloned.
 */
function removeMoveMarkers(op: JSONPatchOp) {
  if (op.path[0] === '$') {
    op.path = op.path.slice(1);
  }
  if (op.from && op.from[0] === '$') {
    op.from = op.from.slice(1);
  }
  if (op.from === op.path) return null;
  return op;
}
