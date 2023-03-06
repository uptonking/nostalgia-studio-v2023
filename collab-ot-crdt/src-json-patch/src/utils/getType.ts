import type { JSONPatchOp, JSONPatchOpHandlerMap } from '../types';
import { types } from '../state';

export function getType(patch: JSONPatchOp) {
  return types?.[patch.op];
}

export function getTypeLike(patch: JSONPatchOp) {
  return types?.[patch.op]?.like;
}
