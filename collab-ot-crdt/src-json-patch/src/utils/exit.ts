import { root } from '../state';
import { type ApplyJSONPatchOptions, type JSONPatchOp } from '../types';

export function exit(
  object: any,
  patch: JSONPatchOp,
  opts: ApplyJSONPatchOptions,
) {
  opts.error = patch;
  return opts.partial && root ? root[''] : object;
}
