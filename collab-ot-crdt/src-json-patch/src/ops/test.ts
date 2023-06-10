import { type JSONPatchOp, type JSONPatchOpHandler } from '../types';
import { deepEqual } from '../utils/deepEqual';
import { getOpData } from '../utils/getOpData';

export const test: JSONPatchOpHandler = {
  like: 'test',

  apply(path, expected) {
    // eslint-disable-next-line no-unused-vars
    const [keys, lastKey, target] = getOpData(path);

    if (target === null) {
      return `[op:test] path not found: ${path}`;
    }

    if (!deepEqual(target[lastKey], expected)) {
      const a = JSON.stringify(target[lastKey]);
      const b = JSON.stringify(expected);

      return `[op:test] not matched: ${a} ${b}`;
    }
  },

  invert() {
    return undefined as any as JSONPatchOp;
  },

  transform(other, ops) {
    return ops;
  },
};
