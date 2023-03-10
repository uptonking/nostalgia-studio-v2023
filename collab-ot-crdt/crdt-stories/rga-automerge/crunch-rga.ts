/**
 * forked from https://github.com/eugene-eeo/crunch-crdt-benchmarks/tree/master/RGA
 * - 实现有问题，测试未通过，实现逻辑更类似woot
 */

/** A charactor, the minimum unit of a CRDT doc */
export class Char {
  user: any;
  ch: any;
  id: any;
  del: boolean;

  constructor(user, ch, id) {
    this.user = user;
    this.id = id;
    this.ch = ch;
    this.del = false;
  }

  /** x < y iff  x.id <= y.id */
  lessThan(obj) {
    return this.id < obj.id || (this.id === obj.id && this.user < obj.user);
  }

  /** this is the unique id for each charactor among all replicas */
  getChrId() {
    return String(this.user) + ' ' + String(this.id);
  }
}

/** delete the ch with `chrId`  */
export class Delete {
  chrId: any;
  constructor(chrId) {
    this.chrId = chrId;
  }
}

/** insert a ch after `preChrId` */
export class Insert {
  /** insert a ch after preChrId */
  preChrId: any;
  chr: any;
  constructor(preChrId, chr) {
    this.preChrId = preChrId;
    this.chr = chr;
  }
}

/**
 * current Char & next Char
 */
class RNode {
  val: Char;
  next: Char | null;
  constructor(chr: Char) {
    this.val = chr;
    this.next = null;
  }

  visibleIndexFrom(start) {
    let d = -1;
    while (start !== this) {
      d++;
      start = start.next;
      while (start !== this && start.val.del) start = start.next;
    }
    return d;
  }
}

/** A linked-list CRDT text obj */
export class RText {
  head: RNode;
  tail: RNode;
  map: Map<any, any>;
  length: number;

  constructor() {
    this.head = new RNode(new Char(-1, 0, 0));
    this.tail = new RNode(new Char(-1, 0, 0));
    this.length = 0;
    this.map = new Map([[this.head.val.getChrId(), this.head]]);
    // todo hack ?
    // @ts-expect-error fix-types
    this.head.next = this.tail;
  }

  len() {
    return this.length;
  }

  cnt() {
    return this.map.size;
  }

  /** [inside replica] add a node at location `loc`
   * - `loc` should always be valid because it only triggered when there is a change in editor
   */
  add(loc, chr) {
    // Create a new Node
    const node = new RNode(chr);

    let idx = 0;
    let cur = this.head;
    while (idx < loc || cur.val.del) {
      if (!cur.val.del) {
        idx++;
      }

      // @ts-expect-error fix-types
      cur = cur.next!;
    }

    // insert a node
    node.next = cur.next;
    // @ts-expect-error fix-types
    cur.next = node;
    this.map.set(node.val.getChrId(), node);

    this.length++;

    // generate `preChrId` for other replica
    return cur.val.getChrId();
  }

  /** [inside replica] remove at location `loc`
   * `loc` should always be valid because it only triggered when there is a change in editor
   */
  remove(loc) {
    let idx = -1;
    let cur = this.head;
    while (idx < loc || cur.val.del) {
      if (!cur.val.del) {
        idx++;
      }

      // @ts-expect-error fix-types
      cur = cur.next;
    }

    if (!cur.val.del) {
      // remove the location by setting the flag
      cur.val.del = true;
      this.length--;
    }

    return cur.val.getChrId();
  }

  // [outside replica] remove a chr
  addAfter(preChrId, chr, returnIndex = false) {
    // Create a new Node
    const node = new RNode(new Char(chr.user, chr.ch, chr.id));
    // already here?
    if (this.map.has(node.val.getChrId())) return;

    let cur = this.map.get(preChrId);
    // skip the larger ids
    while (cur.next !== this.tail && node.val.lessThan(cur.next.val)) {
      cur = cur.next;
    }

    // insert a node
    node.next = cur.next;
    cur.next = node;
    this.map.set(node.val.getChrId(), node);

    this.length++;
    if (returnIndex)
      return { index: node.visibleIndexFrom(this.head), ch: node.val.ch };
  }

  // [outside replica]remove a node with `chrId`
  removeAt(chrId, returnIndex = false) {
    const cur = this.map.get(chrId);
    if (!cur.val.del) {
      // remove the location by setting the flag
      cur.val.del = true;
      this.length--;
      if (returnIndex) return { index: cur.visibleIndexFrom(this.head) };
    }
  }

  // get all non-delete charactors together
  toString() {
    let cur = this.head.next;
    let str = '';
    // @ts-expect-error fix-types
    while (cur !== this.tail) {
      // @ts-expect-error fix-types
      if (!cur?.val.del) {
        // @ts-expect-error fix-types
        str += cur?.val.ch;
      }
      // @ts-expect-error fix-types
      cur = cur.next;
    }

    return str;
  }

  isEmpty() {
    return this.length === 0;
  }

  toJSON() {
    // Return the ordered list as POJOs
    const arr = [];
    let curr = this.head.next;
    // @ts-expect-error fix-types
    while (curr !== this.tail) {
      // @ts-expect-error fix-types
      arr.push(curr.val);
      // @ts-expect-error fix-types
      curr = curr.next;
    }
    return arr;
  }

  static fromJSON(arr) {
    // Construct RGA from JSON
    const text = new RText();
    let prev = text.head;
    for (const chr of arr) {
      // @ts-expect-error fix-types
      const node = new Node(new Char(chr.user, chr.ch, chr.id));
      // @ts-expect-error fix-types
      node.val.del = chr.del;
      // @ts-expect-error fix-types
      text.map.set(node.val.getChrId(), node);
      // @ts-expect-error fix-types
      node.next = prev.next;
      // @ts-expect-error fix-types
      prev.next = node;
      // @ts-expect-error fix-types
      prev = node;
    }
    return text;
  }
}

/** editor content per user */
export class Content {
  user: any;
  text: RText;
  id: any;

  constructor(user) {
    this.user = user;
    this.text = new RText();
  }

  // apply an inner-replica operation
  apply(loc, type, ch) {
    if (type === 'ins') {
      const id = this.text.cnt();
      const chr = new Char(this.user, ch, id);
      const preChrId = this.text.add(loc, new Char(this.user, ch, id));
      return new Insert(preChrId, chr);
    }

    if (type === 'del') {
      return new Delete(this.text.remove(loc));
    }
  }

  applyRemote(op, returnIndex = false) {
    if (op.preChrId) {
      this.applyInsert(op, returnIndex);
    } else {
      this.applyDelete(op, returnIndex);
    }
  }

  // apply an inter-replica insert
  applyInsert(ins, returnIndex) {
    const rv = this.text.addAfter(ins.preChrId, ins.chr, returnIndex);
    return rv;
  }

  // apply an inter-replica Delete
  applyDelete(del, returnIndex) {
    return this.text.removeAt(del.chrId, returnIndex);
  }

  len() {
    return this.text.len();
  }

  toString() {
    return this.text.toString();
  }

  toJSON() {
    return {
      user: this.user,
      text: this.text.toJSON(),
    };
  }

  static fromJSON(obj) {
    const content = new Content(obj.user);
    content.text = RText.fromJSON(obj.text);
    content.id = content.text.cnt();
    return content;
  }
}
