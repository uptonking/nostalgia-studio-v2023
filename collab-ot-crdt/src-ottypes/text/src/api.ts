import { type TextOp } from './text';

/**
 * - Text document API for the 'text' type. This implements some standard API
 * methods for any text-like type, so you can easily bind a textarea or
 * something without being fussy about the underlying OT implementation.
 * - The API is designed as a set of functions to be mixed in to some context
 * object as part of its lifecycle. It expects that object to have getSnapshot
 * and submitOp methods, and call _onOp when an operation is received.
 */
type OTTypeApi = {
  /** Returns the text content of the document */
  get: () => string;
  /** Returns the number of characters in the string */
  getLength(): number;
  /** Insert the specified text at the given position in the document */
  insert(pos: number, text: string, callback: () => {}): void;
  /** removes length characters at position pos */
  remove(
    pos: number,
    lengthOrContent: number | string,
    callback: () => {},
  ): void;
  /** When you use this API, you should implement these two methods.
   * - onInsert: function(pos, text) {}
   * - onRemove: function(pos, removedLength) {}
   */
  _onOp(op: TextOp): void;
  /** Called when text is inserted. */
  onInsert: ((pos: number, text: string) => void) | null;
  /** Called when text is removed */
  onRemove: ((pos: number, removedLength: number) => void) | null;
};

const api = (
  getSnapshot: () => string,
  submitOp: (op: TextOp, cb: () => {}) => void,
): OTTypeApi => {
  return {
    get: getSnapshot,
    getLength() {
      return getSnapshot().length;
    },
    insert(pos, text, callback) {
      return submitOp([pos, text], callback);
    },
    remove(pos, length, callback) {
      return submitOp([pos, { d: length }], callback);
    },
    _onOp(op) {
      let pos = 0;
      let pos1 = 0;
      for (let i = 0; i < op.length; i++) {
        const component = op[i];
        switch (typeof component) {
          case 'number': {
            pos += component;
            pos1 += component;
            break;
          }
          case 'string': {
            if (this.onInsert) this.onInsert(pos, component);
            pos += component.length;
            break;
          }
          case 'object': {
            const delLength =
              typeof component.d === 'string'
                ? component.d.length
                : component.d;
            if (this.onRemove) this.onRemove(pos, delLength);
            pos1 += delLength;
          }
        }
      }
    },
    onInsert: null,
    onRemove: null,
  };
};

api.provides = { text: true };

export { api };
