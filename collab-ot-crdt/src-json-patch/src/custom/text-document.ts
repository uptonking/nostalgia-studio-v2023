import type { Op } from '@typewriter/document';
import type { JSONPatchOpHandler } from '../types';
import { Delta, TextDocument } from '@typewriter/document';
import { log, updateRemovedOps, get } from '../utils';
import { replace } from '../ops';

export const changeText: JSONPatchOpHandler = {
  like: 'replace',

  apply(path, value) {
    const delta = Array.isArray(value) ? new Delta(value) : (value as Delta);
    if (!delta || !Array.isArray(delta.ops)) {
      return 'Invalid delta';
    }

    let existingData: Op[] | TextDocument | Delta | { ops: Op[] } | undefined =
      get(path);

    let doc: TextDocument | undefined;
    if (existingData && (existingData as TextDocument).lines) {
      doc = existingData as TextDocument;
    } else if (Array.isArray(existingData)) {
      if (existingData.length && existingData[0].insert) {
        doc = new TextDocument(new Delta(existingData));
      }
    } else if (existingData && (existingData as Delta).ops) {
      doc = new TextDocument(new Delta((existingData as Delta).ops));
    }

    if (!doc) {
      doc = new TextDocument();
    }

    doc = doc.apply(delta, undefined, true);

    if (hasInvalidOps(doc)) {
      return 'Invalid text delta provided for this text document';
    }

    return replace.apply(path, doc);
  },

  transform(thisOp, otherOps) {
    log('Transforming ', otherOps, ' against "@changeText"', thisOp);

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

  invert({ path, value }, oldValue: TextDocument, changedObj) {
    if (path.endsWith('/-')) path = path.replace('-', changedObj.length);
    const delta = new Delta(value);
    return oldValue === undefined
      ? { op: 'remove', path }
      : { op: '@changeText', path, value: delta.invert(oldValue.toDelta()) };
  },

  compose(delta1, delta2) {
    return new Delta(delta1).compose(new Delta(delta2));
  },
};

function hasInvalidOps(doc: TextDocument) {
  return doc.lines.some((line) => line.content.ops.some((op) => !op.insert));
}
