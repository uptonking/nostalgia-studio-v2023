type ItemsAdded<T = any> = Map<string, T>;
type ItemsDeled<T = any> = Set<T>;
type ItemsRelations<T = any> = Map<string, T>;
type RgaState = [ItemsAdded, ItemsDeled, ItemsRelations];

type OpType = {
  type: 'insert' | 'remove';
  value?: any;
  pos: any;
};
/**  [[prevId,value,id], removeId] */
type MsgType = [[string | null, string | null, any], string | undefined];

/** maybe use uuid/cuid */
const randomId = crypto.randomUUID;

/**
 * Replicated Growable Array / RGA
 */
export const rga = {
  /**
   * init state
   */
  first: (): RgaState => [
    // @ts-expect-error fix-types
    new Map([[null, null]]), // VA
    new Set(), // VR
    new Map(), // E
  ],

  reduce: (
    message: MsgType,
    previous: RgaState,
    changed: (op: OpType) => void,
  ) => {
    const state: RgaState = [
      new Map([...previous[0]]),
      new Set([...previous[1]]),
      new Map([...previous[2]]),
    ];

    const add = message[0];
    const addedVertices = state[0];
    if (add) {
      const beforeVertex = add[0];
      if (beforeVertex && addedVertices.has(beforeVertex)) {
        const value = add[1];
        const id = add[2];
        addedVertices.set(id, value);

        const edges = state[2];

        let l = beforeVertex;
        let r = edges.get(beforeVertex);
        while (addedVertices.has(r) && r > id) {
          l = r;
          r = edges.get(r);
        }
        edges.set(l, id);
        edges.set(id, r);
        changed({ type: 'insert', value, pos: posFor(id, state) });
      }
    }

    const remove = message[1];
    if (remove) {
      const removedVertices = state[1];
      changed({ type: 'remove', pos: posFor(remove, state) });
      removedVertices.add(remove);
    }

    return state;
  },

  valueOf: (state: RgaState) => {
    const [addedVertices, removedVertices, edges] = state;
    const result: any[] = [];
    // @ts-expect-error fix-types
    let id: string = edges.get(null);
    while (id) {
      if (!removedVertices.has(id)) {
        result.push(addedVertices.get(id));
      }
      id = edges.get(id);
    }

    return result;
  },

  mutators: {
    addRight(beforeVertex: string, value: any) {
      const state: RgaState = this;
      const added = state[0];
      const removed = state[1];

      if (added.has(beforeVertex) && !removed.has(beforeVertex)) {
        return [[beforeVertex, value, randomId()]];
      }
    },

    push(value) {
      const state: RgaState = this;
      const edges = state[2];
      let id = null;
      let edge;
      do {
        edge = edges.get(id as unknown as string);
        if (edge) {
          id = edge;
        }
      } while (edge);

      return [[id || null, value, randomId()]] as unknown as MsgType;
    },

    remove(vertex) {
      const state: RgaState = this;
      const [added, removed] = state;
      if (added.has(vertex) && !removed.has(vertex)) {
        return [null, vertex];
      }
    },

    removeAt(pos) {
      const state: RgaState = this;
      const removed = state[1];
      const edges = state[2];
      let i = -1;
      let id = null as unknown as string;
      while (i < pos) {
        if (edges.has(id)) {
          id = edges.get(id);
        } else {
          throw new Error('nothing at pos ' + pos);
        }
        if (!removed.has(id)) {
          i++;
        }
      }

      return rga.mutators.remove.call(state, id);
    },

    set(pos, value) {
      const state: RgaState = this;
      const messages: any[] = [];
      const edges = state[2];
      let i = -1;
      let id = null as unknown as string;
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
      return messages as MsgType[];
    },

    insertAt(pos, value) {
      const state: RgaState = this;
      const messages: any[] = [];
      const edges = state[2];
      let i = 0;
      let id = null as unknown as string;
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
 *
 * @param id
 * @param state
 * @returns
 */
function posFor(id: string, state: RgaState) {
  const edges = state[2];
  let it = null as unknown as string;
  let pos = -1;
  do {
    pos++;
    it = edges.get(it);
  } while (it && it !== id);
  if (!it) {
    pos = -1;
  }

  return pos;
}
