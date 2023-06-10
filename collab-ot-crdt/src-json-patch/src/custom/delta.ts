import { type Op } from '@typewriter/delta';
import { type JSONPatchOpHandler } from '../types';
import { Delta } from '@typewriter/delta';
import { log, updateRemovedOps, get } from '../utils';
import { replace } from '../ops/replace';

export const text: JSONPatchOpHandler = {
  like: 'replace',

  apply(path, value) {
    const delta = Array.isArray(value) ? new Delta(value) : (value as Delta);
    if (!delta || !Array.isArray(delta.ops)) {
      return 'Invalid delta';
    }

    let existingData: Op[] | Delta | { ops: Op[] } | undefined = get(path);

    let doc: Delta | undefined;
    if (Array.isArray(existingData)) {
      if (existingData.length && existingData[0].insert) {
        doc = new Delta(existingData);
      }
    } else if (existingData && existingData.ops) {
      doc = new Delta(existingData.ops);
    }

    if (!doc) {
      doc = new Delta().insert('\n');
    }

    doc = doc.compose(delta);

    if (hasInvalidOps(doc)) {
      return 'Invalid text delta provided for this text document';
    }

    return replace.apply(path, doc);
  },

  transform(thisOp, otherOps) {
    log('Transforming ', otherOps, ' against "@text"', thisOp);

    return updateRemovedOps(
      thisOp.path,
      otherOps,
      false,
      true,
      thisOp.op,
      (op) => {
        if (op.path !== thisOp.path) return null; // If a subpath, it is overwritten
        if (!op.value || !Array.isArray(op.value)) return null; // If not a delta, it is overwritten
        const thisDelta = new Delta(thisOp.value);
        let otherDelta = new Delta(op.value);
        otherDelta = thisDelta.transform(otherDelta, true);
        return { ...op, value: otherDelta.ops };
      },
    );
  },

  invert({ path, value }, oldValue: Delta, changedObj) {
    if (path.endsWith('/-')) path = path.replace('-', changedObj.length);
    const delta = new Delta(value);
    return oldValue === undefined
      ? { op: 'remove', path }
      : { op: '@text', path, value: delta.invert(oldValue) };
  },

  compose(delta1, delta2) {
    return new Delta(delta1).compose(new Delta(delta2));
  },
};

function hasInvalidOps(doc: Delta) {
  return doc.ops.some((op) => !op.insert);
}
