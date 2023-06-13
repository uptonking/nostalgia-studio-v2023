// @ts-nocheck

// Flags for Computed and Effect.
const RUNNING = 1 << 0;
const NOTIFIED = 1 << 1;
const OUTDATED = 1 << 2;
const DISPOSED = 1 << 3; // 8
const HAS_ERROR = 1 << 4;
const TRACKING = 1 << 5; // 32

/** A linked list node used to track dependencies (sources) and dependents (targets).
 * Also used to remember the source's last version number that the target saw.
 */
type Node = {
  // A source whose value the target depends on.
  _source: Signal;
  _prevSource?: Node;
  _nextSource?: Node;

  // A target that depends on the source and should be notified when the source changes.
  _target: Computed | Effect;
  _prevTarget?: Node;
  _nextTarget?: Node;

  // The version number of the source that target has last seen. We use version numbers
  // instead of storing the source value, because source values can take arbitrary amount
  // of memory, and computeds could hang on to them forever because they're lazily evaluated.
  // Use the special value -1 to mark potentially unused but recyclable nodes.
  _version: number;

  // Used to remember & roll back the source's previous `._node` value when entering &
  // exiting a new evaluation context.
  _rollbackNode?: Node;
};

// Currently evaluated computed or effect.
let evalContext: Computed | Effect | undefined = undefined;

// Effects collected into a batch.
let batchedEffect: Effect | undefined = undefined;
let batchDepth = 0;
let batchIteration = 0;

// A global version number for signals, used for fast-pathing repeated
// computed.peek()/computed.value calls when nothing has changed globally.
let globalVersion = 0;

function signal<T>(value: T): Signal<T> {
  return new Signal(value);
}

class Signal<T = any> {
  _value: unknown;
  _version: number;
  _node?: any;
  _targets?: any;

  constructor(value?: unknown) {
    this._value = value;
    this._version = 0;
    this._node = undefined;
    this._targets = undefined;
  }

  _subscribe(node) {
    if (this._targets !== node && node._prevTarget === undefined) {
      node._nextTarget = this._targets;
      if (this._targets !== undefined) {
        this._targets._prevTarget = node;
      }
      this._targets = node;
    }
  }

  _unsubscribe(node) {
    // Only run the unsubscribe step if the signal has any subscribers to begin with.
    if (this._targets !== undefined) {
      const prev = node._prevTarget;
      const next = node._nextTarget;
      if (prev !== undefined) {
        prev._nextTarget = next;
        node._prevTarget = undefined;
      }
      if (next !== undefined) {
        next._prevTarget = prev;
        node._nextTarget = undefined;
      }
      if (node === this._targets) {
        this._targets = next;
      }
    }
  }

  subscribe(fn) {
    const signal = this;

    return effect(function (this: Effect) {
      // @ts-expect-error fix-types
      const value = signal.value;
      const flag = this._flags & TRACKING;
      this._flags &= ~TRACKING;
      try {
        fn(value);
      } finally {
        this._flags |= flag;
      }
    });
  }

  valueOf() {
    return this.value;
  }

  peek() {
    return this._value;
  }
  get value() {
    return this._value;
  }
  set value(v) {
    this._value = v;
  }
}

Object.defineProperty(Signal.prototype, 'value', {
  get() {},
  set(this: Signal, value) {},
});

function Computed(this: Computed, compute: () => unknown) {
  Signal.call(this, undefined);

  this._compute = compute;
  this._sources = undefined;
  this._globalVersion = globalVersion - 1;
  this._flags = OUTDATED;
}

function computed<T>(compute: () => T): ReadonlySignal<T> {
  return new Computed(compute);
}

function Effect(this: Effect, compute: () => unknown | EffectCleanup) {
  this._compute = compute;
  this._cleanup = undefined;
  this._sources = undefined;
  this._nextBatchedEffect = undefined;
  this._flags = TRACKING;
}
