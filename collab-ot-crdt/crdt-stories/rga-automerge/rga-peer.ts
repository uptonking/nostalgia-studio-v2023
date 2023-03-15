type ItemsAdded<T = unknown> = Map<number | null, T>;
type ItemsDeled<T = number | null> = Set<T>;
/** map as a linked list */
type ItemToNext<T = number | null> = Map<T, T>;
type RgaState = [ItemsAdded, ItemsDeled, ItemToNext];

/** op to update RgaState
 * - support insert/remove
 */
type OpType = {
  type: 'insert' | 'remove';
  value?: unknown;
  pos: number;
};

/**  [  [prevId,value,id],  removeId  ]
 * - uniform msg, support add/remove op
 * ? better to use object
 */
type MsgType = [[number | null, unknown, number | null] | null, number?];

let counter = 1;
/** increasing id */
// const randomId = () => crypto.randomUUID().replace(/-/g, '');
const randomId = () => counter++;

/**
 * Replicated Growable Array / RGA
 * - forked from https://github.com/ipfs-shipyard/peer-crdt/blob/master/src/types/rga.js
 *
 * todo
 * - insert should consider timestamp and siteId
 */
export const rga = {
  /**
   * init state
   * - [ Added, removed, relations]
   */
  first: (): RgaState => [
    new Map([[null, null]]), // VA
    new Set(), // VR
    new Map(), // E
  ],

  /**
   * get items without tomstone from RgaState, and return their values as array
   */
  valueOf: (state: RgaState) => {
    const [addedItems, removedItems, itemToNext] = state;
    const result: unknown[] = [];
    let id: number = itemToNext.get(null)!;
    while (id) {
      if (!removedItems.has(id)) {
        result.push(addedItems.get(id));
      }
      id = itemToNext.get(id)!;
    }

    return result;
  },

  /**
   * apply message op
   * @param message operation
   * @param previous RgaState
   * @param changed cb after op
   * @returns updated state
   */
  reduce: (
    message: MsgType,
    previous: RgaState,
    changed?: (op: OpType) => void,
  ) => {
    const state: RgaState = [
      new Map([...previous[0]]),
      new Set([...previous[1]]),
      new Map([...previous[2]]),
    ];

    const addedItems = state[0];
    const add = message[0];
    if (add) {
      const beforeVertex = add[0];
      if (addedItems.has(beforeVertex)) {
        // /for existing prevId
        const value = add[1];
        const id = add[2];
        addedItems.set(id, value);

        const edges = state[2];

        let l = beforeVertex;
        let r = edges.get(beforeVertex)!;

        // id maybe null in production, but number 3>null still true
        while (addedItems.has(r) && id! < r) {
          // / find id > r, 💡 insert-id be right to beforeVertex ,and bigger than left
          l = r;
          r = edges.get(r)!;
        }

        edges.set(l, id);
        edges.set(id, r);
        if (id && changed) {
          changed({ type: 'insert', value, pos: posFor(id, state) });
        }
      }
    }

    const remove = message[1];
    if (remove) {
      const removedItems = state[1];
      if (changed) changed({ type: 'remove', pos: posFor(remove, state) });
      removedItems.add(remove);
    }

    return state;
  },

  /**
   * all mutation to RgaState will generate operations, then apply/reduce
   */
  mutators: {
    /** return a op message, that add value+newId to the right of beforeVertex */
    addRight(beforeVertex: number, value: unknown) {
      const state: RgaState = this;
      const added = state[0];
      const removed = state[1];

      if (added.has(beforeVertex) && !removed.has(beforeVertex)) {
        return [[beforeVertex, value, randomId()]] as MsgType;
      }
    },

    /**
     * add value to the end of rga-list
     */
    push(value: unknown) {
      const state: RgaState = this;
      const edges = state[2];
      let id = null;
      let edge;
      do {
        edge = edges.get(id);
        if (edge) {
          id = edge;
        }
      } while (edge);

      return [[id || null, value, randomId()]] as MsgType;
    },

    /**
     * remove only if added and not removed
     */
    remove(id: number) {
      const state: RgaState = this;
      const [added, removed] = state;
      if (added.has(id) && !removed.has(id)) {
        return [null, id] as MsgType;
      }
    },

    removeAt(pos: number) {
      const state: RgaState = this;
      const removed = state[1];
      const edges = state[2];
      let i = -1;
      let id: null | number = null;
      while (i < pos) {
        if (edges.has(id)) {
          id = edges.get(id)!;
        } else {
          throw new Error('nothing at pos ' + pos);
        }
        if (!removed.has(id)) {
          i++;
        }
      }

      return rga.mutators.remove.call(state, id);
    },

    /**
     * set value at position
     * - insert new, then remove old
     */
    set(pos: number, value: unknown) {
      const state: RgaState = this;
      const messages: MsgType[] = [];
      const edges = state[2];
      let i = -1;
      let id = null;
      while (i < pos) {
        let next;
        if (edges.has(id)) {
          next = edges.get(id);
        }
        if (!next) {
          next = randomId();
          messages.push([[id, null, next]]);
        }
        id = next;
        i++;
      }

      if (edges.has(id)) {
        messages.push(rga.mutators.remove.call(state, id)); // remove
      }
      messages.push([[id, value, randomId()]]);
      // return pull.values(messages)
      return messages;
    },

    /**
     * insert value at pos
     */
    insertAt(pos: number, value: unknown) {
      const state: RgaState = this;
      const messages: MsgType[] = [];
      const edges = state[2];
      let i = 0;
      let id = null;
      while (i < pos) {
        let next;
        if (edges.has(id)) {
          next = edges.get(id);
        }
        if (!next) {
          next = randomId();
          messages.push([[id, null, next]]);
        }
        id = next;
        i++;
      }
      messages.push(rga.mutators.addRight.call(state, id, value));
      if (!messages.length) {
        return;
      }
      if (messages.length === 1) {
        return messages[0];
      }
      // return pull.values(messages)
      return messages as MsgType[];
    },
  },
};

/**
 * find the numeric index for the id item
 */
function posFor(id: number, state: RgaState) {
  const edges = state[2];
  let it: null | number = null;
  let pos = -1;
  do {
    pos++;
    it = edges.get(it)!;
  } while (it && it !== id);

  if (!it) {
    pos = -1;
  }

  return pos;
}
