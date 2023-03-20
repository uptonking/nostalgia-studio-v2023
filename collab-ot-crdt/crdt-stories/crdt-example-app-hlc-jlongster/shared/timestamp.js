/* global globalThis */
const config = {
  /** Maximum physical clock drift allowed, in ms. In other words, if we
   * receive a message from another node and that node's time differs from
   * ours by more than this many milliseconds, throw an error.
   */
  maxDrift: 60000,
};

/**
 * @typedef {Object} TimestampState
 * @property {number} millis time in milliseconds
 * @property {number} counter grow-only counter
 * @property {string} node client id，存放客户端id
 */

/** hybrid logical clock，只读时间戳，修改操作需要使用子类方法，核心方法是send/recv
 * - `<datetime>-<counter>-<client ID>`
 * - An HLC combines both a physical and logical clock.
 * - It was designed to provide one-way causality detection while maintaining a clock value close to the physical clock,
 *  so one can use HLC timestamp as a drop-in replacement for a physical clock timestamp
 * - 👉🏻 Rules
 * - Each node maintain its own monotonic counter, c (just like with logical clocks)
 * - Each node keeps track of the largest physical time it has encountered so far - this is called the "logical" time (l)
 * - When a message is received: The receiving node updates its own logical clock to ensure that it moves forward by picking whichever of the following is greater
 */
class Timestamp {
  constructor(millis, counter, node) {
    /**
     * @type {TimestampState}
     */
    this._state = {
      millis: millis,
      counter: counter,
      node: node,
    };
  }

  valueOf() {
    return this.toString();
  }

  /**
   * - 序列化Timestamp，date为毫秒，counter用16进制4位表示
   * - counter is a hexadecimal encoded version of the counter, always 4 chars in length
   *    - 👉🏻 ensuring that we never have more that 4 chars means there is a limit to how big the counter can be: 65535. (2^16=65536)
   * @return stringified timestamps are FIXED LENGTH in the format `<datetime>-<counter>-<client ID>`
   */
  toString() {
    return [
      new Date(this.millis()).toISOString(),
      ('0000' + this.counter().toString(16).toUpperCase()).slice(-4),
      ('0000000000000000' + this.node()).slice(-16),
    ].join('-');
  }

  millis() {
    return this._state.millis;
  }

  counter() {
    return this._state.counter;
  }

  node() {
    return this._state.node;
  }

  /** 用来构建merkle-tree，时间戳具有唯一性可代表op-msg，但构建时用的只是hash值 */
  hash() {
    return globalThis['murmur'](this.toString()); // 确保murmur之前注册过了，要检查import顺序
  }
}

/** 只包含修改方法
 * @extends Timestamp
 */
class MutableTimestamp extends Timestamp {
  setMillis(n) {
    this._state.millis = n;
  }

  setCounter(n) {
    this._state.counter = n;
  }

  setNode(n) {
    this._state.node = n;
  }
}

MutableTimestamp.from = (timestamp) => {
  return new MutableTimestamp(
    timestamp.millis(),
    timestamp.counter(),
    timestamp.node(),
  );
};

/** Timestamp generator initialization
 * - sets the node ID to an arbitrary value
 * - useful for mocking/unit testing
 */
Timestamp.init = function (options = {}) {
  if (options.maxDrift) {
    config.maxDrift = options.maxDrift;
  }
};

/** 创建并返回一个新的hybrid logical clock时间戳对象。
 * - 每次crud操作都会带有一个新时间戳。一般是counter+1
 * - create a new timestamp every time a message is sent
 *  (i.e., every time a database CRUD operation causes a new message to be created/sent)
 * - Generates a unique, monotonic(单调的) timestamp suitable
 * for transmission to another system in string format
 */
Timestamp.send = function (clock) {
  // Retrieve the local wall time
  const phys = Date.now();

  // Unpack the clock.timestamp logical time and counter
  const lOld = clock.timestamp.millis();
  const cOld = clock.timestamp.counter();

  // Calculate the next logical time and counter
  // ensure that the logical time never goes backward
  // increment the counter if phys time does not advance
  const lNew = Math.max(lOld, phys);
  const cNew = lOld === lNew ? cOld + 1 : 0;

  // Check the result for drift and counter overflow
  if (lNew - phys > config.maxDrift) {
    throw new Timestamp.ClockDriftError(lNew, phys, config.maxDrift);
  }

  if (cNew > 65535) {
    // We don't support counters greater than 65535 because we need to ensure
    // that, when converted to a hex string, it doesn't use more than 4 chars
    // (see Timestamp.toString). For example:
    //   (65534).toString(16) -> fffe
    //   (65535).toString(16) -> ffff
    //   (65536).toString(16) -> 10000 -- oops, this is 5 chars
    // It's not that a larger counter couldn't be used--that would just mean
    // increasing the expected length of the counter part of the timestamp
    // and updating the code that parses/generates that string. Some sort of
    // length needs to be picked, and therefore there is going to be some sort
    // of limit to how big the counter can be.
    throw new Timestamp.OverflowError();
  }

  // Repack the logical time/counter
  clock.timestamp.setMillis(lNew);
  clock.timestamp.setCounter(cNew);

  return new Timestamp(
    clock.timestamp.millis(),
    clock.timestamp.counter(),
    clock.timestamp.node(),
  );
};

/** 更新本地logic clock为更大的，每次收到服务端op都会执行，离线的本地操作不执行这里。
 * - Timestamp receive. Parses and merges a timestamp from a remote
 * system with the local time. global uniqueness and monotonicity are
 * preserved
 */
Timestamp.recv = function (clock, msg) {
  const phys = Date.now();

  // Unpack the message wall time/counter
  const lMsg = msg.millis();
  const cMsg = msg.counter();

  // Assert the node id and remote clock drift
  if (msg.node() === clock.timestamp.node()) {
    // Whoops, looks like the message came from the same node ID as ours!
    throw new Timestamp.DuplicateNodeError(clock.timestamp.node());
  }

  if (lMsg - phys > config.maxDrift) {
    // Whoops, the other node's physical time differs from ours by more than
    // the configured limit (e.g., 1 minute).
    throw new Timestamp.ClockDriftError();
  }

  // Unpack the clock.timestamp logical time and counter
  const lOld = clock.timestamp.millis();
  const cOld = clock.timestamp.counter();

  // Calculate the next logical time and counter.
  // Ensure that the logical time never goes backward;
  // * if all logical clocks are equal, increment the max counter,
  // * if max = old > message, increment local counter,
  // * if max = messsage > old, increment message counter,
  // * otherwise, clocks are monotonic, reset counter
  const lNew = Math.max(Math.max(lOld, phys), lMsg);
  // 如果logic time相同，就只会增加counter
  const cNew =
    lNew === lOld && lNew === lMsg
      ? Math.max(cOld, cMsg) + 1
      : lNew === lOld
      ? cOld + 1
      : lNew === lMsg
      ? cMsg + 1
      // 💡 若本地物理时钟大，则重置counter为0
      : 0;

  // Check the result for drift and counter overflow
  if (lNew - phys > config.maxDrift) {
    throw new Timestamp.ClockDriftError();
  }
  if (cNew > 65535) {
    throw new Timestamp.OverflowError();
  }

  // Repack the logical time/counter
  clock.timestamp.setMillis(lNew);
  clock.timestamp.setCounter(cNew);

  return new Timestamp(
    clock.timestamp.millis(),
    clock.timestamp.counter(),
    clock.timestamp.node(),
  );
};

/** Converts a fixed-length string timestamp to the structured value. 反序列化
 * - sets this to elapsed msecs since 1/1/70 (e.g., when receiving a message)
 * @param {string} timestamp 类似 2022-10-30T14:23:11.112Z-0000-a02156e53043eaab
 */
Timestamp.parse = function (timestamp) {
  if (typeof timestamp === 'string') {
    const parts = timestamp.split('-');
    if (parts && parts.length === 5) {
      const millis = Date.parse(parts.slice(0, 3).join('-')).valueOf();
      const counter = parseInt(parts[3], 16);
      const node = parts[4];
      if (!isNaN(millis) && !isNaN(counter))
        return new Timestamp(millis, counter, node);
    }
  }
  return null;
};

/** ？ */
Timestamp.since = (isoString) => {
  return isoString + '-0000-0000000000000000';
};

Timestamp.DuplicateNodeError = class extends Error {
  constructor(node) {
    super();
    this.type = 'DuplicateNodeError';
    this.message = 'duplicate node identifier ' + node;
  }
};

Timestamp.ClockDriftError = class extends Error {
  constructor(...args) {
    super();
    this.type = 'ClockDriftError';
    this.message = ['maximum clock drift exceeded'].concat(args).join(' ');
  }
};

Timestamp.OverflowError = class extends Error {
  constructor() {
    super();
    this.type = 'OverflowError';
    this.message = 'timestamp counter overflow';
  }
};

export { MutableTimestamp, Timestamp };

globalThis['Timestamp'] = Timestamp;
globalThis['MutableTimestamp'] = MutableTimestamp;

// console.log(';;murmur ', globalThis['murmur']);
// console.log(';;win ', window && window['Timestamp']);
