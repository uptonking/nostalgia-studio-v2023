import * as array from 'lib0/array';
import * as binary from 'lib0/binary';
import * as buffer from 'lib0/buffer';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as error from 'lib0/error';
import * as f from 'lib0/function';
import { callAll } from 'lib0/function';
import * as iterator from 'lib0/iterator';
import * as logging from 'lib0/logging';
import * as map from 'lib0/map';
import * as math from 'lib0/math';
import * as object from 'lib0/object';
import { Observable } from 'lib0/observable';
import * as promise from 'lib0/promise';
import * as random from 'lib0/random';
import * as set from 'lib0/set';
import * as time from 'lib0/time';

export class ID {
  client: number;
  clock: number;

  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(client, clock) {
    /**
     * Client id
     * @type {number}
     */
    this.client = client;
    /**
     * unique per client id, continuous number
     * @type {number}
     */
    this.clock = clock;
  }
}

/**
 *
 */
export class StructStore {
  // clients: Map<number, Array<GC | Item>>;
  clients: Map<number, any[]>;
  pendingStructs: null | { missing: Map<number, number>; update: Uint8Array };
  pendingDs: null | Uint8Array;

  constructor() {
    /**
     * @type {Map<number,Array<GC|Item>>}
     */
    this.clients = new Map();
    /**
     * @type {null | { missing: Map<number, number>, update: Uint8Array }}
     */
    this.pendingStructs = null;
    /**
     * @type {null | Uint8Array}
     */
    this.pendingDs = null;
  }
}

export class AbstractStruct {
  id: ID;
  length: number;

  /**
   * @param {ID} id
   * @param {number} length
   */
  constructor(id, length) {
    this.id = id;
    this.length = length;
  }

  /**
   * @type {boolean}
   */
  get deleted() {
    throw error.methodUnimplemented();
  }

  /**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} wether this merged with right
   */
  mergeWith(right) {
    return false;
  }

  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */
  write(encoder, offset, encodingRef) {
    throw error.methodUnimplemented();
  }

  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(transaction, offset) {
    throw error.methodUnimplemented();
  }
}

export class DeleteItem {
  clock: number;
  len: number;

  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(clock, len) {
    /**
     * @type {number}
     */
    this.clock = clock;
    /**
     * @type {number}
     */
    this.len = len;
  }
}

/**
 * We no longer maintain a DeleteStore.
 * - DeleteSet is a temporary object that is created when needed.
 * - When created in a transaction, it must only be accessed after sorting, and merging
 *   - This DeleteSet is send to other clients
 * - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
 * - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
 */
export class DeleteSet {
  clients: Map<number, DeleteItem[]>;

  constructor() {
    /**
     * @type {Map<number,Array<DeleteItem>>}
     */
    this.clients = new Map();
  }
}

/**
 * General event handler implementation.
 *
 * @template ARG0, ARG1
 *
 * @private
 */
export class EventHandler {
  l: Array<(...args: any[]) => void>;

  constructor() {
    /**
     * @type {Array<function(ARG0, ARG1):void>}
     */
    this.l = [];
  }
}

/**
 * This is an abstract interface that all Connectors should implement to keep them interchangeable.
 *
 * @note This interface is experimental and it is not advised to actually inherit this class.
 *       It just serves as typing information.
 *
 * @extends {Observable<any>}
 */
export class AbstractConnector extends Observable {
  doc: any;
  awareness: any;
  /**
   * @param {Doc} ydoc
   * @param {any} awareness
   */
  constructor(ydoc, awareness) {
    super();
    this.doc = ydoc;
    this.awareness = awareness;
  }
}
