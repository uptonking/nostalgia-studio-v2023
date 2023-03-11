/**
 * - Max num of chars is 2 ** 24
 * - Max num of replicas is 2 ** 8
 */
const TIMESTAMP_BITS = 24;

type RChar = {
  /** identifier for char */
  timestamp: number;
  chr: string;
  removed: boolean;
  /** next node  */
  next: RChar;
};

/**
 * ✨ CRDT RGA
 */
export class RgaText {
  /** siteId */
  id: number;
  /** increment for every op. 其他用户传来op的时间戳不会更新本地的 */
  timestamp: number;
  /** the core linked-list representing the text */
  left: RChar;
  /** get char-item from map is faster than from list */
  index: Map<number, RChar>;
  subscribers: Function[];

  constructor(id) {
    this.id = id;
    // @ts-expect-error fix-types ❓ 首次插入时需要一个前驱节点
    this.left = { timestamp: 0, removed: false, chr: '' };
    this.index = new Map([[this.left.timestamp, this.left]]);
    // this.timestamp = null;
    this.subscribers = [];
  }

  /**
   * list to array
   */
  static toArray(rga: RgaText) {
    const arr: RChar[] = [];
    let curr = rga.left;
    while (curr) {
      arr.push(curr);
      curr = curr.next;
    }
    return arr;
  }

  // Public interface
  /**  */
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  receive(op) {
    return this[op.type].call(this, op);
  }

  /** receive action and exec subscribed fn */
  downstream(op) {
    const node = this.receive(op);
    op.sender = this.id;
    if (node) {
      this.subscribers.forEach((cb) => cb(op));
    }
    return node;
  }

  /**
   * Insertion consists in placing the new node to the right of the reference node
   * and at the left of the first node whose identifier precedes the new identifier
   */
  private add(op) {
    if (this.index.get(op.t)) return;

    let prev = this.index.get(op.prev);
    if (!prev) {
      return this.requestHistory(op);
    }

    while (prev.next && op.t < prev.next.timestamp) {
      prev = prev.next;
    }

    const newNode = {
      next: prev.next,
      timestamp: op.t,
      chr: op.chr,
      removed: false,
    };

    prev.next = newNode;
    this.index.set(newNode.timestamp, newNode);

    return newNode;
  }

  private remove(op) {
    const node = this.index.get(op.t);

    if (!node) {
      return this.requestHistory(op);
    }

    if (node.removed) {
      return;
    }

    node.removed = true;
    return node;
  }

  // Private
  private requestHistory(op) {
    this.subscribers.forEach((callback) => {
      callback({
        type: 'historyRequest',
        // since: timestamp,
        // sender: this.id,
        // recipient: sender
      });
    });
  }

  private historyRequest() {
    this.subscribers.forEach((callback) => {
      callback({ type: 'batch', ops: this.history() });
    });
  }

  private batch({ ops }) {
    ops.forEach((op) => {
      this.receive(op);
    });
  }

  /**
   * ❓ 更新本地时间戳，只在本地产生op时才更新，其他用户传来op不会更新
   */
  genTimestamp() {
    this.timestamp = (this.timestamp || this.id << TIMESTAMP_BITS) + 1;
    return this.timestamp;
  }

  private history() {
    const hist: any[] = [];
    let prev = this.left;
    let curr = prev.next;

    while (curr) {
      hist.push({
        type: 'add',
        prev: prev.timestamp,
        t: curr.timestamp,
        chr: curr.chr,
      });

      if (curr.removed) {
        hist.push({ type: 'remove', t: curr.timestamp });
      }

      prev = curr;
      curr = curr.next;
    }

    return hist;
  }
}

export class RgaToText {
  array: RChar[];
  /** remove deleted */
  compactedArray: RChar[];

  constructor(rga) {
    this.array = RgaText.toArray(rga);
    this.compactedArray = this.array.filter(({ removed }) => !removed);
  }

  text() {
    return this.compactedArray
      .map(({ chr }) => {
        return chr;
      })
      .join('');
  }

  indexOrPrev(node) {
    let idx = this.array.indexOf(node);

    while (idx >= 0 && node.removed) {
      idx = idx - 1;
      node = this.array[idx];
    }

    return this.compactedArray.indexOf(node);
  }

  get(idx) {
    return this.compactedArray[idx];
  }
}

export class ACERgaAdapter {
  rga: RgaText;
  emitContentChanged: boolean;
  bufferOperations: boolean;
  operationsBuffer: any[];
  session: any;
  selection: any;
  nodeSelection: { startNode: any; endNode: any };

  constructor(id, editor) {
    this.rga = new RgaText(id);
    this.emitContentChanged = true;
    this.bufferOperations = false;
    this.operationsBuffer = [];

    editor.$blockScrolling = Infinity;

    this.session = editor.session;
    this.session.on('change', this.contentChanged.bind(this));
    this.selection?.on('changeCursor', this.cursorChanged.bind(this));

    this.selection = editor.selection;
    // const Doc = this.session.doc.constructor;
    this.nodeSelection = { startNode: this.rga.left, endNode: this.rga.left };
    const { onCompositionStart, onCompositionEnd } = editor;
    editor.onCompositionStart = () => {
      this.bufferOperations = true;
      onCompositionStart.receive(editor, []);
    };

    editor.onCompositionEnd = () => {
      try {
        onCompositionEnd.receive(editor, []);
      } finally {
        setTimeout(this.flushBuffer, 100);
      }
    };
  }

  // Public interface
  /** exec if received op from server;
   * add to buffer, then update data and ui
   */
  receive(op) {
    if (this.bufferOperations) {
      this.operationsBuffer.push(op);
    } else {
      this.rga.receive(op);
      this.syncEditor();
    }
  }

  receiveHistory(history) {
    history.forEach((op) => this.rga.receive(op));
    this.syncEditor();
  }

  subscribe(sub) {
    this.rga.subscribe(sub);
  }

  /** generate insert op and update rga */
  contentInserted(from, change) {
    const ary = new RgaToText(this.rga).compactedArray;

    let node = ary[from] || this.rga.left;

    change.forEach((chr) => {
      node = this.rga.downstream({
        type: 'add',
        prev: node.timestamp,
        t: this.rga.genTimestamp(),
        chr: chr,
      });
    });
  }

  contentRemoved(from, change) {
    const ary = new RgaToText(this.rga).compactedArray;

    ary.slice(from, from + change.length).forEach((node) => {
      this.rga.downstream({ type: 'remove', t: node.timestamp });
    });
  }

  /** pub editor-change to crdt */
  contentChanged({ action, start, end, lines }) {
    if (!this.emitContentChanged) {
      return;
    }

    const from = this.session.doc.positionToIndex(start);
    const change = lines.join('\n').split('');

    if (action === 'insert') {
      this.contentInserted(from, change);
    } else if (action === 'remove') {
      this.contentRemoved(from + 1, change);
    }
  }

  /** pub editor-cursor-change to crdt */
  cursorChanged() {
    if (!this.emitContentChanged) {
      return;
    }

    const { start, end } = this.selection.getRange();
    const rgaAry = new RgaToText(this.rga);
    // const doc = new Doc(rgaAry.text());
    const doc = new this.session.doc.constructor(rgaAry.text());
    const startIndex = doc.positionToIndex(start);
    const startNode = rgaAry.get(startIndex);
    const endIndex = doc.positionToIndex(end);
    const endNode = rgaAry.get(endIndex);

    this.nodeSelection = { startNode: startNode, endNode: endNode };
  }

  /** update ace-editor contents by setValue */
  syncEditor() {
    this.emitContentChanged = false;

    try {
      const rgaAry = new RgaToText(this.rga);
      const text = rgaAry.text();
      // const doc = new Doc(text);
      const doc = new this.session.doc.constructor(text);
      const { startNode, endNode } = this.nodeSelection;
      const startIndex = rgaAry.indexOrPrev(startNode);
      const endIndex = rgaAry.indexOrPrev(endNode);
      const rangeStart = doc.indexToPosition(startIndex);
      const rangeEnd = doc.indexToPosition(endIndex);
      const range = { start: rangeStart, end: rangeEnd };

      this.session.doc.setValue(text);
      this.selection.setSelectionRange(range);
    } finally {
      this.emitContentChanged = true;
    }
  }

  flushBuffer() {
    this.receiveHistory(this.operationsBuffer);
    this.bufferOperations = false;
    this.operationsBuffer = [];
  }
}
