/**
 * forked from https://github.com/ROKAF-ResourceManagementSystemDeveloper/crdt/blob/main/frontend/src/lib/crdt/RADT/RGA.ts
 */

import { type SerializedVectorClock, VectorClock } from './vector-clock';

export type SerializedS4Vector = Pick<S4Vector, 'sid' | 'seq' | 'sum'>;

/**
 *
 */
export class S4Vector {
  readonly key: string;
  /** siteId */
  readonly sid: number;
  /** sum of the clocks in vector */
  readonly sum: number;
  /** for purging tombstones */
  readonly seq: number;

  constructor(sid: number, sum: number, seq: number) {
    this.sid = sid;
    this.sum = sum;
    this.seq = seq;
    this.key = `${this.sid} ${this.sum} ${this.seq}`;
  }

  isPreceding(target?: S4Vector) {
    return (
      target &&
      (this.sum < target.sum ||
        (this.sum === target.sum && this.sid < target.sid))
    );
  }

  toSerializable(): SerializedS4Vector {
    return { sid: this.sid, sum: this.sum, seq: this.seq };
  }

  static fromSerializable(ss4: SerializedS4Vector) {
    return new S4Vector(ss4.sid, ss4.sum, ss4.seq);
  }
}

export interface RGANode {
  data: any;
  /**  */
  link: RGANode | null;
  s4: S4Vector;
  s4k?: S4Vector;
  s4p?: S4Vector;
}

export function isTombstone(n?: RGANode) {
  return n && n.data === null;
}

export class RGATxt {
  #head: RGANode;
  #map = new Map<string, RGANode>();
  /**
   * ? useless, is it safe to delete
   */
  #cemetery: RGANode[] = [];

  static HEAD_S4 = new S4Vector(-1, -1, -1);

  constructor() {
    this.#head = {
      data: null,
      link: null,
      s4: RGATxt.HEAD_S4,
      s4k: RGATxt.HEAD_S4,
      s4p: RGATxt.HEAD_S4,
    };
    this.#map.set(RGATxt.HEAD_S4.key, this.#head);
  }

  findNode(offset: number) {
    let count = 0;
    let currentNode = this.#head;
    while (true) {
      if (offset === count) {
        return currentNode;
      } else {
        currentNode = currentNode.link!;
        if (!isTombstone(currentNode)) {
          count++;
        }
      }
      if (currentNode === null) {
        return null;
      }
    }
  }

  read(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    return targetNode?.data;
  }

  getAll() {
    let currentNode = this.#head;
    const list: RGANode[] = [];
    while (currentNode.link !== null) {
      currentNode = currentNode.link;
      list.push(currentNode);
    }
    console.log(list);
    return list;
  }

  text() {
    let currentNode = this.#head;
    let text = '';
    while (currentNode.link !== null) {
      currentNode = currentNode.link;
      if (!isTombstone(currentNode)) {
        text += currentNode.data;
      }
    }
    return text;
  }

  localInsert(prevS4: S4Vector, s4: S4Vector, data: any) {
    const prevNode = this.#map.get(prevS4.key);
    if (isTombstone(prevNode) && prevS4.key !== RGATxt.HEAD_S4.key) {
      return false;
    }
    if (this.#map.has(s4.key)) {
      return false;
    }
    const newNode = {
      data: data,
      link: prevNode!.link,
      s4k: s4,
      s4p: s4,
      s4: s4,
    };
    if (prevNode) prevNode.link = newNode;
    this.#map.set(s4.key, newNode);
    return true;
  }

  localDelete(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode) || s4.key === RGATxt.HEAD_S4.key) {
      return false;
    }

    if (targetNode) targetNode.data = null;
    this.#cemetery.push(targetNode!);
    return true;
  }

  localUpdate(s4: S4Vector, data: any) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode) || s4.key === RGATxt.HEAD_S4.key) {
      return false;
    }

    if (targetNode) targetNode.data = data;
    return true;
  }

  remoteInsert(prevS4: S4Vector, s4: S4Vector, data: any) {
    let prevNode = this.#map.get(prevS4.key);

    const newNode: RGANode = {
      data: data,
      s4k: s4,
      s4p: s4,
      link: null,
      s4: s4,
    };
    this.#map.set(s4.key, newNode);

    while (
      prevNode &&
      prevNode.link !== null &&
      prevNode.s4k &&
      newNode.s4k!.isPreceding(prevNode.link.s4k)
    ) {
      prevNode = prevNode.link;
    }

    newNode.link = prevNode!.link;
    if (prevNode) prevNode.link = newNode;

    return true;
  }
  remoteDelete(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    if (targetNode && !isTombstone(targetNode)) {
      targetNode.data = null;
      targetNode.s4p = s4;
    }
    return true;
  }
  remoteUpdate(s4: S4Vector, data: any) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode)) {
      return false;
    }
    if (targetNode) targetNode.data = data;
    return true;
  }
}

interface InsertMessageData {
  s4: SerializedS4Vector;
  prevS4: SerializedS4Vector;
  vc: SerializedVectorClock;
  data: any;
}
interface DeleteMessageData {
  s4: SerializedS4Vector;
  vc: SerializedVectorClock;
}
interface UpdateMessageData {
  s4: SerializedS4Vector;
  vc: SerializedVectorClock;
  data: any;
}

export default class RGAClient {
  sid = -1;
  vc = new VectorClock();
  rga = new RGATxt();
  // wsc: WebSocketClient;
  wsc: any;

  constructor(sid: number) {
    this.sid = sid;
    // this.wsc = WebSocketClient.connect("_" /* localhost:8082/ws?offset=0 */, {
    //   customWebsocket: FakeWebSocket,
    //   onOpen: (wsc, e) => {
    //     wsc.on("insert", (data: InsertMessageData) => {
    //       const sentVC = VectorClock.fromSerializable(data.vc);
    //       const prevS4 = S4Vector.fromSerializable(data.prevS4);
    //       const newS4 = S4Vector.fromSerializable(data.s4);
    //       if (newS4.sid === this.sid) {
    //         return;
    //       }
    //       this.vc.merge(sentVC);
    //       this.rga.remoteInsert(prevS4, newS4, data.data);
    //       this.onChange(this.rga.text());
    //     });
    //     wsc.on("delete", (data: DeleteMessageData) => {
    //       const sentVC = VectorClock.fromSerializable(data.vc);
    //       const targetS4 = S4Vector.fromSerializable(data.s4);
    //       this.vc.merge(sentVC);
    //       this.rga.remoteDelete(targetS4);
    //       this.onChange(this.rga.text());
    //     });
    //     wsc.on("update", (data: UpdateMessageData) => {
    //       const sentVC = VectorClock.fromSerializable(data.vc);
    //       const targetS4 = S4Vector.fromSerializable(data.s4);
    //       this.vc.merge(sentVC);
    //       this.rga.remoteUpdate(targetS4, data.data);
    //       this.onChange(this.rga.text());
    //     });
    //   },
    // });
  }

  insert(offset: number, data: any) {
    const prevNode = this.rga.findNode(offset);
    console.log(offset, prevNode);
    if (prevNode === null) {
      return;
    }
    this.vc.update(this.sid);
    const newS4 = new S4Vector(this.sid, this.vc.sum, 1);
    this.rga.localInsert(prevNode.s4, newS4, data);
    const dataToSend: InsertMessageData = {
      s4: newS4.toSerializable(),
      prevS4: prevNode.s4.toSerializable(),
      data: data,
      vc: this.vc.toSerializable(),
    };
    this.wsc.send('insert', dataToSend);
    this.onChange(this.rga.text());
  }

  delete(offset: number) {
    const targetNode = this.rga.findNode(offset);
    if (targetNode === null) {
      return;
    }
    this.vc.update(this.sid);
    this.rga.localDelete(targetNode.s4);
    const dataToSend: DeleteMessageData = {
      s4: targetNode.s4.toSerializable(),
      vc: this.vc.toSerializable(),
    };
    this.wsc.send('delete', dataToSend);
    this.onChange(this.rga.text());
  }

  update(offset: number, data: any) {
    const targetNode = this.rga.findNode(offset);
    if (targetNode === null) {
      return;
    }
    this.vc.update(this.sid);
    this.rga.localDelete(targetNode.s4);
    const dataToSend: UpdateMessageData = {
      s4: targetNode.s4.toSerializable(),
      vc: this.vc.toSerializable(),
      data: data,
    };
    this.wsc.send('update', dataToSend);
    this.onChange(this.rga.text());
  }

  onChange: (list: string) => void;
}
