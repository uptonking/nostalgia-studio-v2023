import { nanoid as uuid } from 'nanoid';

import {
  type Change,
  type CONTENT_KEY,
  type DeleteOperation,
  type ElemId,
  type InputOperation,
  type InsertOperation,
  type Json,
  type JsonComposite,
  type Metadata,
  type ObjectId,
  type Operation,
  type OperationId,
  type Patch,
} from '../types';
import { type DistributiveOmit } from '../types/utils';
import { CHILDREN, HEAD, ROOT } from '../utils/constants';

/**
 * Miniature implementation of a subset of Automerge.
 */
export class RichTextSeq {
  /** Key in the root object containing the text content. */
  public static contentKey: CONTENT_KEY = 'text';

  /** ID of the client using the document. */
  public actorId: string;
  /** Map actorId to last sequence number seen from that actor. */
  public clock: Record<string, number> = {};

  /** Current sequence number. */
  private seq = 0;
  /** Highest operation seen so far. */
  private maxOp = 0;

  /** main data for document
   * - map operationId to operation-value */
  private objects: Record<ObjectId, JsonComposite> &
    Record<typeof ROOT, Record<string, Json>> = {
      [ROOT]: {},
    };

  /** Map objectID to CRDT metadata for each object field. */
  private metadata: Record<ObjectId, Metadata> = {
    [ROOT]: { [CHILDREN]: {} },
  };

  constructor(clientId = uuid()) {
    this.actorId = clientId;
  }

  /**
   * Returns the document root object.
   */
  get root(): Record<string, Json> {
    return this.objects[ROOT];
  }

  /**
   * Return the document root object, cast to a given shape.
   * - The result will still make all fields optional, so the consumer
   * needs to do runtime checking.
   */
  // TODO: Make RecursivePartial<T>.
  public getRoot<T extends Record<string, Json>>(): Partial<T> {
    return this.objects[ROOT] as T;
  }

  /**
   * Generates a new change containing operations described in the array `ops`.
   * - Returns the change object, which can be JSON-encoded to send to another node.
   * - data wont update here; this function only converts ops to changeTrObject
   */
  public change(ops: Array<InputOperation>): {
    change: Change;
    patches: Patch[];
  } {
    // Record the dependencies of this change:
    // anything in our clock before we generate the change.
    const deps = { ...this.clock };

    // Record a new local seq number in our clock,
    // to remember we've incorporated this new change
    this.seq += 1;
    this.clock[this.actorId] = this.seq;

    const changeTr: Change = {
      actor: this.actorId,
      seq: this.seq,
      deps,
      startOp: this.maxOp + 1,
      ops: [],
    };

    const patchesForChange: Patch[] = [];

    for (const inputOp of ops) {
      const objId = this.getObjectIdForPath(inputOp.path);
      const obj = this.objects[objId];
      if (!obj) {
        throw new Error(`Object doesn't exist: ${String(objId)}`);
      }
      const meta = this.metadata[objId];
      if (!meta) {
        throw new Error(`Object ID not found: ${String(objId)}`);
      }

      // Check if the operation is modifying a list object.
      if (Array.isArray(obj) && Array.isArray(meta)) {
        if (inputOp.action === 'insert') {
          // will insert after elemId
          let elemId =
            inputOp.index === 0
              ? HEAD
              : getListElementId(meta, inputOp.index - 1, {
                // ? why after tombstone
                lookAfterTombstones: true,
              });

          for (const value of inputOp.values) {
            const { opId: result, patches } = this.makeNewOp(changeTr, {
              action: 'set',
              obj: objId,
              elemId,
              value,
              insert: true,
            });
            elemId = result;
            patchesForChange.push(...patches);
          }
        } else if (inputOp.action === 'delete') {
          // It might seem like we should increment the index we delete at
          // as we delete characters. However, because we delete a character
          // at each iteration, the start index for the "delete" input operation
          // always points to the next character to delete, without incrementing.
          //
          // For example, see what happens when we delete first 3 chars from index 0:
          // { action: "delete", index: 0, count: 3 }
          // 0123456 > del-0 > del-0 > xxx3456

          for (let i = 0; i < inputOp.count; i++) {
            const elemId = getListElementId(meta, inputOp.index);
            const { patches } = this.makeNewOp(changeTr, {
              action: 'del',
              obj: objId,
              elemId,
            });
            patchesForChange.push(...patches);
          }
        } else if (
          inputOp.action === 'addMark' ||
          inputOp.action === 'removeMark'
        ) {
          // const partialOp = changeMark(inputOp, objId, meta, obj);
          // const { patches } = this.makeNewOp(change, partialOp);
          // patchesForChange.push(...patches);
        } else if (inputOp.action === 'del') {
          throw new Error('Use the remove action');
        } else if (
          inputOp.action === 'makeList' ||
          inputOp.action === 'makeMap' ||
          inputOp.action === 'set'
        ) {
          throw new Error('Unimplemented');
        } else {
          // unreachable(inputOp)
        }
      } else {
        // /The operation is modifying a map object.

        if (
          inputOp.action === 'makeList' ||
          inputOp.action === 'makeMap' ||
          inputOp.action === 'del'
          // TODO: Why can't I handle the "del" case here????
          // inputOp.action === "del"
        ) {
          const { patches } = this.makeNewOp(changeTr, {
            action: inputOp.action,
            obj: objId,
            key: inputOp.key,
          });
          patchesForChange.push(...patches);
        } else if (inputOp.action === 'set') {
          const { patches } = this.makeNewOp(changeTr, {
            action: inputOp.action,
            obj: objId,
            key: inputOp.key,
            value: inputOp.value,
          });
          patchesForChange.push(...patches);
        } else if (
          inputOp.action === 'addMark' ||
          inputOp.action === 'removeMark' ||
          inputOp.action === 'insert' ||
          inputOp.action === 'delete'
        ) {
          throw new Error(`Not a list: ${inputOp.path}`);
        } else {
          // unreachable(inputOp)
        }
      }
    }

    return { change: changeTr, patches: patchesForChange };
  }

  /**
   * Updates the document state by applying the change object `change`, in the format documented here:
   * - https://github.com/automerge/automerge-classic/blob/performance/BINARY_FORMAT.md#json-representation-of-changes
   */
  applyChange(change: Change): Patch[] {
    // Check that the change's dependencies are met
    const lastSeq = this.clock[change.actor] || 0;
    if (change.seq !== lastSeq + 1) {
      throw new RangeError(
        `Expected sequence number ${lastSeq + 1}, got ${change.seq}`,
      );
    }
    for (const [actor, dep] of Object.entries(change.deps)) {
      if (!this.clock[actor] || this.clock[actor] < dep) {
        throw new RangeError(
          `Missing dependency: change ${dep} by actor ${actor}`,
        );
      }
    }

    this.clock[change.actor] = change.seq;
    this.maxOp = Math.max(this.maxOp, change.startOp + change.ops.length - 1);

    return change.ops.flatMap(this.applyOp);
  }

  /**
   * Updates the document state with one of the operations from a change.
   */
  private applyOp = (op: Operation): Patch[] => {
    const metadata = this.metadata[op.obj];
    const obj = this.objects[op.obj];
    if (!metadata || obj === undefined) {
      throw new RangeError(`Object does not exist: ${String(op.obj)}`);
    }

    if (op.action === 'makeMap') {
      this.objects[op.opId] = {};
      this.metadata[op.opId] = { [CHILDREN]: {} };
    } else if (op.action === 'makeList') {
      this.objects[op.opId] = [];
      this.metadata[op.opId] = [];
    }

    if (Array.isArray(metadata)) {
      if (!Array.isArray(obj)) {
        throw new Error(
          `Non-array object with array metadata: ${String(op.obj)}`,
        );
      }
      if (op.action === 'set') {
        if (op.elemId === undefined) {
          throw new Error('Must specify elemId when calling set on an array');
        }
        return this.applyListInsert(op as InsertOperation);
      } else if (op.action === 'del') {
        if (op.elemId === undefined) {
          throw new Error('Must specify elemId when calling del on an array');
        }
        return this.applyListUpdate(op as DeleteOperation);
      } else if (op.action === 'addMark' || op.action === 'removeMark') {
        // return applyAddRemoveMark(op, obj, metadata);
      } else if (op.action === 'makeList' || op.action === 'makeMap') {
        throw new Error('Unimplemented');
      } else {
        // unreachable(op)
        throw new Error('applyOp of op array is unreachable, ' + op);
      }
    } else {
      if (op.action === 'addMark' || op.action === 'removeMark') {
        throw new Error("Can't call addMark or removeMark on a map");
      }
      if (op.key === undefined) {
        throw new Error('Must specify key when calling set or del on a map');
      }
      // Updating a key in a map. Use last-writer-wins semantics: the operation takes effect if its
      // opId is greater than the last operation for that key; otherwise we ignore it.
      const obj = this.objects[op.obj];
      if (Array.isArray(obj)) {
        throw new Error(
          `Metadata is map but object is array: ${String(op.obj)}`,
        );
      }
      const keyMeta = metadata[op.key];

      if (keyMeta === undefined || compareOpIds(keyMeta, op.opId) === -1) {
        metadata[op.key] = op.opId;
        if (op.action === 'del') {
          delete obj[op.key];
        } else if (op.action === 'makeList') {
          obj[op.key] = this.objects[op.opId];
          metadata[CHILDREN][op.key] = op.opId;
          return [{ ...op, path: ['text'] }];
        } else if (op.action === 'makeMap') {
          // todo BUG: this does not return a patch which means maps are not cleared on reinitialization
          obj[op.key] = this.objects[op.opId];
          metadata[CHILDREN][op.key] = op.opId;
        } else if (op.action === 'set') {
          obj[op.key] = op.value;
        } else {
          throw new Error('applyOp of op is unreachable, ' + op);
        }
      }
    }

    // If we've reached this point, that means we haven't yet implemented
    // the logic to return a correct patch for applying this particular op.
    return [];
  };

  /**
   * Apply a list insertion operation.
   *
   * TODO: Extend this to take MakeMapOperation and MakeListOperation.
   */
  private applyListInsert(op: InsertOperation): Patch[] {
    const metadata = this.metadata[op.obj];
    if (!Array.isArray(metadata)) {
      throw new Error(`Not a list: ${String(op.obj)}`);
    }

    // op.elemId is the ID of the reference element; we want to insert after this element
    let { index, visible } =
      op.elemId === HEAD
        ? { index: -1, visible: 0 }
        : this.findListElement(op.obj, op.elemId);
    if (index >= 0 && !metadata[index].deleted) {
      visible++;
    }
    index++;

    // Skip over any elements whose elemId is greater than op.opId
    // (this ensures convergence when there are concurrent insertions at the same position)
    while (
      index < metadata.length &&
      compareOpIds(op.opId, metadata[index].elemId) < 0
    ) {
      if (!metadata[index].deleted) {
        visible++;
      }
      index++;
    }

    // Insert the new list element metadata at the correct index
    metadata.splice(index, 0, {
      elemId: op.opId,
      valueId: op.opId,
      deleted: false,
    });

    const obj = this.objects[op.obj];
    if (!Array.isArray(obj)) {
      throw new Error(`Not a list: ${String(op.obj)}`);
    }

    const value =
      // TODO: Add this back in.
      // op.action === "makeList" || op.action === "makeMap"
      //     ? this.objects[op.opId] :
      op.value;

    if (typeof value !== 'string') {
      throw new Error(`Expected value inserted into text to be a string`);
    }

    // insert value
    obj.splice(visible, 0, value);

    // todo
    // const marks = getActiveMarksAtIndex(metadata, index)

    return [
      {
        // TODO: We don't have convenient access to the path here so we just hardcode.
        // In a real implementation, would need to resolve object ID into path.
        path: [RichTextSeq.contentKey],
        action: 'insert',
        index: visible,
        values: [value],
        marks: {},
      },
    ];
  }

  /**
   * Applies a list element update (setting the value of a list element, or deleting a list element).
   */
  private applyListUpdate(op: DeleteOperation): Patch[] {
    const { index, visible } = this.findListElement(op.obj, op.elemId);
    const listMeta = this.metadata[op.obj];
    if (listMeta === undefined) {
      throw new Error(`Object not found: ${String(op.obj)}`);
    }
    if (!Array.isArray(listMeta)) {
      throw new Error(`Not a list: ${String(op.obj)}`);
    }
    const meta = listMeta[index];

    // TODO: Do we need to compare op ids here for deletion?
    if (op.action === 'del') {
      if (!meta.deleted) {
        const obj = this.objects[op.obj];
        if (!Array.isArray(obj)) {
          throw new Error(`Not a list: ${String(op.obj)}`);
        }
        meta.deleted = true;
        obj.splice(visible, 1);

        return [
          {
            action: 'delete',
            path: [RichTextSeq.contentKey],
            index: visible,
            count: 1,
          },
        ];
      }
    } else if (compareOpIds(meta.valueId, op.opId) < 0) {
      throw new Error('Not implemented yet');
    }

    return [];
  }

  //   public getTextWithFormatting(path: OperationPath): Array<FormatSpanWithText> {
  //     const objectId = this.getObjectIdForPath(path)
  //     const text = this.objects[objectId]
  //     const metadata = this.metadata[objectId]

  //     if (text === undefined || !(text instanceof Array)) {
  //         throw new Error(`Expected a list at object ID ${objectId.toString()}`)
  //     }
  //     if (metadata === undefined || !(metadata instanceof Array)) {
  //         throw new Error(`Expected list metadata for object ID ${objectId.toString()}`)
  //     }

  //     return getTextWithFormatting(text, metadata)
  // }

  /**
   * Searches for the list element with ID `elemId` in the object with ID `objectId` from `this.metadata`.
   * - Returns an object `{index, visible}` where `index` is the index of the element
   * in the metadata array, and `visible` is the number of non-deleted elements
   * that precede the specified element.
   */
  private findListElement(
    objectId: ObjectId,
    elemId: ElemId,
  ): {
    index: number;
    visible: number;
  } {
    let index = 0;
    let visible = 0;
    const meta = this.metadata[objectId];
    if (!meta) {
      throw new Error(`Object ID not found: ${String(objectId)}`);
    }
    if (!Array.isArray(meta)) {
      throw new Error('Expected array metadata for findListElement');
    }

    while (index < meta.length && meta[index].elemId !== elemId) {
      if (!meta[index].deleted) {
        visible++;
      }
      index++;
    }
    if (index === meta.length) {
      throw new RangeError(`List element not found: ${String(elemId)}`);
    }

    return { index, visible };
  }

  /**
   * Returns the ID of the object at a particular path in the document tree.
   */
  getObjectIdForPath(path: InputOperation['path']): ObjectId {
    let objectId: ObjectId = ROOT;
    for (const pathElem of path) {
      const meta: Metadata = this.metadata[objectId];
      if (meta === undefined) {
        throw new RangeError(`No object at path ${JSON.stringify(path)}`);
      }
      if (Array.isArray(meta)) {
        throw new RangeError(
          `Object ${pathElem} in path ${JSON.stringify(path)} is a list`,
        );
      }
      const childId: ObjectId | undefined = meta[CHILDREN][pathElem];
      if (childId === undefined) {
        throw new Error(`Child not found: ${pathElem} in ${String(objectId)}`);
      }
      objectId = childId;
    }
    return objectId;
  }

  /**
   * Adds an operation to a new change being generated, and also applies it to the document.
   * - Returns the new operation's opId.
   */
  private makeNewOp(
    change: Change,
    op: DistributiveOmit<Operation, 'opId'>,
  ): { opId: OperationId; patches: Patch[] } {
    this.maxOp += 1;
    const opId = `${this.maxOp}@${this.actorId}`;
    const opWithId = { opId, ...op };
    const patches = this.applyOp(opWithId);
    change.ops.push(opWithId);
    return { opId, patches };
  }
}

/**
 * Scans the list object with ID `objectId` and returns the element ID of the `index`-th
 * non-deleted element.
 * - This is essentially the inverse of `findListElement()`.
 */
export function getListElementId(
  meta: Metadata,
  index: number,
  options?: { lookAfterTombstones: boolean },
): OperationId {
  let visible = -1;
  if (!Array.isArray(meta)) {
    throw new Error('Expected array metadata for findListElement');
  }
  for (const [metaIndex, element] of meta.entries()) {
    if (!element.deleted) {
      visible++;
      if (visible === index) {
        if (options?.lookAfterTombstones) {
          // Normally in Automerge we insert new characters before any tombstones at the insertion position.
          // But when formatting is involved, we sometimes want to insert after some of the tombstones.
          // We peek ahead and see if there are any tombstones that have a non-empty markOpsAfter;
          // If there are, we want to put this new character after the last such tombstone.
          // This ensures that if there are non-growing marks which end at this insertion position,
          // this new character is inserted after the span-end.
          // See the test case labeled "handles growth behavior for spans where
          // the boundary is a tombstone" for a motivating example of why this behavior is needed.
          let elemIndex = metaIndex;
          let peekIndex = metaIndex + 1;
          let latestIndexAfterTombstone: number | undefined;

          while (meta[peekIndex] && meta[peekIndex].deleted) {
            // eslint-disable-next-line max-depth
            if (meta[peekIndex].markOpsAfter !== undefined) {
              latestIndexAfterTombstone = peekIndex;
            }
            peekIndex++;
          }
          if (latestIndexAfterTombstone) {
            elemIndex = latestIndexAfterTombstone;
          }
          return meta[elemIndex].elemId;
        } else {
          return element.elemId;
        }
      }
    }
  }

  throw new RangeError(`List index out of bounds: ${index}`);
}

/**
 * Compares two operation IDs in the form `counter@actorId`.
 * - Returns -1 if `id1` < `id2`, 0 if they are equal, +1 if `id1` > `id2`.
 * - Order is defined by first comparing counter values; if IDs have equal counter values, we lexicographically compare actorIds.
 */
export function compareOpIds(id1: OperationId, id2: OperationId): -1 | 0 | 1 {
  // TODO: can we make undefined a valid input?
  if (id1 === id2) return 0;
  const regex = /^([0-9]+)@(.*)$/;
  const match1 = regex.exec(id1);
  const match2 = regex.exec(id2);
  if (!match1) {
    throw new Error(`Invalid operation ID: ${id1}`);
  }
  if (!match2) {
    throw new Error(`Invalid operation ID: ${id2}`);
  }
  const counter1 = parseInt(match1[1], 10);
  const counter2 = parseInt(match2[1], 10);

  // todo rewrite
  return counter1 < counter2 || (counter1 === counter2 && match1[2] < match2[2])
    ? -1
    : +1;
}
