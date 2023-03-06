export { applyPatch } from './applyPatch';
export { invertPatch } from './invertPatch';
export { transformPatch } from './transformPatch';
export { composePatch } from './composePatch';
export { JSONPatch } from './jsonPatch';
export * from './syncable';
export * as defaultOps from './ops';

export type {
  JSONPatchOpHandlerMap as JSONPatchCustomTypes,
  ApplyJSONPatchOptions,
  JSONPatchOp,
} from './types';
