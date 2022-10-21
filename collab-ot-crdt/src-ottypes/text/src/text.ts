/** operation中编辑指令的类型，num代表retain，str代表插入，{d: num}代表删除
 * - A number N: Skip N characters in the original document
 * - "str"     : Insert "str" at the current position in the document
 * - {d:N}     : Delete N characters at the current position in the document
 */
export type TextOpComponent = number | string | { d: number | string };
/** 一个Operation就是编辑指令数组，EditActions[]
 * - OP are lists of components which iterate over the document.
 * - The operation does not have to skip the last characters in the document.
 */
export type TextOp = TextOpComponent[];

/** api for standard operational transform types
 * - Each OT type exposes a single object with the following properties.
 */
export interface TextType<R> {
  /** A user-readable name for the type. This is not guaranteed to be unique. */
  name: string;
  /** A canonical location for this ot type spec.  */
  uri?: string;
  /** create the initial document snapshot.  */
  create: (initial?: string) => R;
  /** Apply an operation to a document snapshot. Returns the changed snapshot.
   * - For performance, old document must not be used after this function call, so apply may reuse and return the current snapshot object. */
  apply(doc: R, op: TextOp): R;
  /** 👉🏻 Transform op1 by op2. Return the new `op1`.
   * - side is either 'left' or 'right', useful if two operations insert at the same position in a string.
   * - Both op1 and op2 must not be modified by transform.
   * - Transform must conform to Transform Property 1.
   * - That is, `apply(apply(str, op1), transform(op2, op1, 'left')) == apply(apply(str, op2), transform(op1, op2, 'right'))`.  */
  transform(op1: TextOp, op2: TextOp, side: 'left' | 'right'): TextOp;
  /** Compose op1 and op2 to produce a new operation.
   * - `apply(apply(snapshot, op1), op2) == apply(snapshot, compose(op1, op2))`.
   * - Note: transforming by a composed operation is NOT guaranteed to produce the same result as transforming by each operation in order.
   */
  compose?(a: TextOp, b: TextOp): TextOp;
  /** Invert the given operation. The original operation must not be edited in the process.
   * - `apply(apply(snapshot, op), invert(op)) == snapshot` */
  invert?(op: TextOp): TextOp;
  checkOp?: (op: TextOp) => void;
  normalize?: (op: TextOp) => TextOp;
  trim?: (op: TextOp) => TextOp;
  transformPosition?(cursor: number, op: TextOp): number;
  transformSelection?(
    selection: number | [number, number],
    op: TextOp,
  ): number | [number, number];
  // [k: string]: any;
}

export const dlen = (d: number | string) =>
  typeof d === 'number' ? d : d.length;
const id = <T>(x: T) => x;

/** Create a new text snapshot.
 * @param {string} initial - initial snapshot data. Optional. Defaults to ''
 */
const create = (initial: string = '') => {
  if (initial != null && typeof initial !== 'string') {
    throw Error('Initial data must be a string');
  }
  return initial;
};

/** Check the operation is valid. Throws if not valid. */
const checkOp = (op: TextOp) => {
  if (!Array.isArray(op)) throw Error('Op must be an array of components');

  let last = null;
  for (let i = 0; i < op.length; i++) {
    const c = op[i];
    switch (typeof c) {
      case 'object':
        // The only valid objects are {d:X} for +ive values of X or non-empty strings.
        if (typeof c.d !== 'number' && typeof c.d !== 'string')
          throw Error('Delete must be number or string');
        if (dlen(c.d) <= 0) throw Error('Deletes must not be empty');
        break;
      case 'string':
        // Strings are inserts.
        if (!(c.length > 0)) throw Error('Inserts cannot be empty');
        break;
      case 'number':
        // Numbers must be skips. They have to be +ive numbers.
        if (!(c > 0)) throw Error('Skip components must be >0');
        if (typeof last === 'number')
          throw Error('Adjacent skip components should be combined');
        break;
    }
    last = c;
  }

  if (typeof last === 'number') throw Error('Op has a trailing skip');
};

/** Check that the given selection range is valid. */
const checkSelection = (selection) => {
  // This may throw from simply inspecting selection[0] / selection[1]. Thats
  // sort of ok, though it'll generate the wrong message.
  if (
    typeof selection !== 'number' &&
    (typeof selection[0] !== 'number' || typeof selection[1] !== 'number')
  ) {
    throw Error('Invalid selection');
  }
};

/** Make a function that appends to the given operation. */
const makeAppend = (op: TextOp) => (component: TextOpComponent) => {
  if (!component || (component as any).d === 0 || (component as any).d === '') {
    // The component is a no-op. Ignore!
  } else if (op.length === 0) {
    op.push(component);
  } else if (typeof component === typeof op[op.length - 1]) {
    if (typeof component === 'object') {
      // Concatenate deletes. This is annoying because the op or component could
      // contain strings or numbers.
      const last = op[op.length - 1] as { d: number | string };
      last.d =
        typeof last.d === 'string' && typeof component.d === 'string'
          ? last.d + component.d // Preserve invert information
          : dlen(last.d) + dlen(component.d); // Discard invert information, if any.

      // (op[op.length - 1] as {d:number}).d += component.d
    } else {
      // Concat strings / inserts. TSC should be smart enough for this :p
      (op[op.length - 1] as any) += component as any;
    }
  } else {
    op.push(component);
  }
};

/** Makes and returns utility functions take and peek.
 */
const makeTake = (op: TextOp) => {
  // TODO: Rewrite this by passing a context, like the rust code does. Its cleaner that way.

  // The index of the next component to take
  let idx = 0;
  // The offset into the component. For strings this is in UCS2 length, not
  // unicode codepoints.
  let offset = 0;

  // Take up to length n from the front of op. If n is -1, take the entire next
  // op component. If indivisableField == 'd', delete components won't be separated.
  // If indivisableField == 'i', insert components won't be separated.
  const take = (n, indivisableField?: string) => {
    // We're at the end of the operation. The op has skips, forever. Infinity
    // might make more sense than null here.
    if (idx === op.length) return n === -1 ? null : n;

    const c = op[idx];
    let part;
    if (typeof c === 'number') {
      // Skip
      if (n === -1 || c - offset <= n) {
        part = c - offset;
        ++idx;
        offset = 0;
        return part;
      } else {
        offset += n;
        return n;
      }
    } else if (typeof c === 'string') {
      // Insert
      if (n === -1 || indivisableField === 'i' || c.length - offset <= n) {
        part = c.slice(offset);
        ++idx;
        offset = 0;
        return part;
      } else {
        part = c.slice(offset, offset + n);
        offset += n;
        return part;
      }
    } else {
      const delLength = typeof c.d === 'string' ? c.d.length : c.d;
      // Delete
      if (n === -1 || indivisableField === 'd' || delLength - offset <= n) {
        part = { d: delLength - offset };
        ++idx;
        offset = 0;
        return part;
      } else {
        offset += n;
        return { d: n };
      }
    }
  };

  // Peek at the next op that will be returned.
  const peek = () => op[idx];

  return { take, peek };
};

/** Get the length of a component */
const componentLength = (c) => (typeof c === 'number' ? c : c.length || c.d);

/** Trim any excess skips from the end of an operation.
 * - There should only be at most one, because the operation was made with append.
 */
const trim = (op: TextOp) => {
  if (op.length > 0 && typeof op[op.length - 1] === 'number') {
    op.pop();
  }
  return op;
};

const normalize = function (op) {
  const newOp = [];
  const append = makeAppend(newOp);
  for (let i = 0; i < op.length; i++) append(op[i]);
  return trim(newOp);
};

/** Apply an operation to a document snapshot */
const apply = (str: string, op: TextOp) => {
  if (typeof str !== 'string') {
    throw Error('Snapshot should be a string');
  }
  checkOp(op);

  // We'll gather the new document here and join at the end.
  const newDoc = [];

  for (let i = 0; i < op.length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'number':
        if (component > str.length)
          throw Error('The op is too long for this document');

        newDoc.push(str.slice(0, component));
        // This might be slow for big strings. Consider storing the offset in
        // str instead of rewriting it each time.
        str = str.slice(component);
        break;
      case 'string':
        newDoc.push(component);
        break;
      case 'object':
        str = str.slice(dlen(component.d));
        break;
    }
  }

  return newDoc.join('') + str;
};

/** Transform op by otherOp.
 *
 * @param op - The operation to transform
 * @param otherOp - Operation to transform it by
 * @param side - Either 'left' or 'right'
 */
const transform = (op: TextOp, otherOp: TextOp, side: 'left' | 'right') => {
  if (side !== 'left' && side !== 'right') {
    throw Error('side (' + side + ") must be 'left' or 'right'");
  }

  checkOp(op);
  checkOp(otherOp);

  const newOp = [];

  const append = makeAppend(newOp);
  const { take, peek } = makeTake(op);

  for (let i = 0; i < otherOp.length; i++) {
    const component = otherOp[i];

    let length;
    let chunk;
    switch (typeof component) {
      case 'number': // Skip
        length = component;
        while (length > 0) {
          chunk = take(length, 'i');
          append(chunk);
          if (typeof chunk !== 'string') {
            length -= componentLength(chunk);
          }
        }
        break;

      case 'string': // Insert
        if (side === 'left') {
          // The left insert should go first.
          if (typeof peek() === 'string') {
            append(take(-1));
          }
        }

        // Otherwise skip the inserted text.
        append(component.length);
        break;

      case 'object': // Delete
        length = component.d;
        while (length > 0) {
          chunk = take(length, 'i');
          switch (typeof chunk) {
            case 'number':
              length -= chunk;
              break;
            case 'string':
              append(chunk);
              break;
            case 'object':
              // The delete is unnecessary now - the text has already been deleted.
              length -= chunk.d;
          }
        }
        break;
    }
  }

  // Append any extra data in op1.
  let c;
  while ((c = take(-1))) append(c);

  return trim(newOp);
};

/** Compose op1 and op2 together and return the result */
const compose = function (op1, op2) {
  checkOp(op1);
  checkOp(op2);

  const result = [];
  const append = makeAppend(result);
  const take = makeTake(op1)[0];

  for (let i = 0; i < op2.length; i++) {
    const component = op2[i];
    let length;
    let chunk;
    switch (typeof component) {
      case 'number': // Skip
        length = component;
        while (length > 0) {
          chunk = take(length, 'd');
          append(chunk);
          if (typeof chunk !== 'object') {
            length -= componentLength(chunk);
          }
        }
        break;

      case 'string': // Insert
        append(component);
        break;

      case 'object': // Delete
        length = component.d;

        while (length > 0) {
          chunk = take(length, 'd');

          switch (typeof chunk) {
            case 'number':
              append({ d: chunk });
              length -= chunk;
              break;
            case 'string':
              length -= chunk.length;
              break;
            case 'object':
              append(chunk);
          }
        }
        break;
    }
  }

  let c;
  while ((c = take(-1))) append(c);

  return trim(result);
};

const transformPosition = (cursor, op) => {
  let pos = 0;
  for (let i = 0; i < op.length; i++) {
    const c = op[i];
    if (cursor <= pos) break;

    // I could actually use the op_iter stuff above - but I think its simpler
    // like this.
    switch (typeof c) {
      case 'number':
        if (cursor <= pos + c) return cursor;
        pos += c;
        break;

      case 'string':
        pos += c.length;
        cursor += c.length;
        break;

      case 'object':
        cursor -= Math.min(c.d, cursor - pos);
        break;
    }
  }
  return cursor;
};

const transformSelection = function (selection, op, isOwnOp) {
  let pos = 0;
  if (isOwnOp) {
    // Just track the position. We'll teleport the cursor to the end anyway.
    // This works because text ops don't have any trailing skips at the end - so the last
    // component is the last thing.
    for (let i = 0; i < op.length; i++) {
      const c = op[i];
      switch (typeof c) {
        case 'number':
          pos += c;
          break;
        case 'string':
          pos += c.length;
          break;
        // Just eat deletes.
      }
    }
    return pos;
  } else {
    return typeof selection === 'number'
      ? transformPosition(selection, op)
      : [
          transformPosition(selection[0], op),
          transformPosition(selection[1], op),
        ];
  }
};

const selectionEq = function (c1, c2) {
  if (c1[0] != null && c1[0] === c1[1]) c1 = c1[0];
  if (c2[0] != null && c2[0] === c2[1]) c2 = c2[0];
  return (
    c1 === c2 ||
    (c1[0] != null && c2[0] != null && c1[0] === c2[0] && c1[1] == c2[1])
  );
};

export function makeType<Snap = string>(): TextType<Snap> {
  return {
    name: 'text',
    uri: 'http://sharejs.org/types/textv1',
    create: create as unknown as TextType<Snap>['create'],
    apply: apply as unknown as TextType<Snap>['apply'],
    transform: transform as unknown as TextType<Snap>['transform'],
  };
}
