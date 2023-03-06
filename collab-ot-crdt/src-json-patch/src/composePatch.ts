import { runWithObject } from './state';
import type { JSONPatchOp, JSONPatchOpHandlerMap } from './types';
import { getType, getValue, mapAndFilterOps } from './utils';
import { getTypes } from './ops';

export function composePatch(
  patches: JSONPatchOp[],
  custom: JSONPatchOpHandlerMap = {},
): JSONPatchOp[] {
  const types = getTypes(custom);
  const opsByPath = new Map<string, JSONPatchOp>();

  // Only composing ops next to each other on the same path. It becomes too complex to do more because of moves and arrays
  return runWithObject(null, types, patches.length > 1, () => {
    return mapAndFilterOps(patches, (op) => {
      const type = getType(op);
      const handler = type?.compose;
      if (handler) {
        const lastOp = opsByPath.get(op.path);
        if (lastOp && match(lastOp, op)) {
          lastOp.value = handler(lastOp.value, op.value);
          return null;
        } else {
          const prefix = `${op.path}/`;
          for (const path of opsByPath.keys()) {
            if (path.startsWith(prefix)) opsByPath.delete(path);
          }
          opsByPath.set(op.path, (op = getValue(op)));
        }
      } else {
        opsByPath.clear();
      }
      return op;
    });
  });
}

function match(op1: JSONPatchOp, op2?: JSONPatchOp) {
  return op1 && op2 && op1.op === op2.op && op1.path === op2.path;
}
