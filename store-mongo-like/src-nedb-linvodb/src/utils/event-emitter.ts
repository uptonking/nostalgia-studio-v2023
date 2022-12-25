// https://github.com/serviejs/events

/**
 * All events are emitted using this key.
 * - used to listen to _all_ events, i.e. for debugging.
 */
export const ALL_EVENTS = Symbol('ALL_EVENTS');

/**
 * Valid `ALL_EVENTS` listener args.
 */
export type AllEventsArg<T> = {
  [K in keyof T]: { type: K; args: T[K] };
}[keyof T];

/**
 * Internally defined emitter events.
 */
export interface EmitterEvents<T> {
  [ALL_EVENTS]: [AllEventsArg<T>];
}

/**
 * All possible events, user provided and built-in.
 */
export type Events<T> = T & EmitterEvents<T>;

/**
 * List of valid event args given `K`.
 */
export type ValidEventArgs<
  T,
  K extends keyof Events<T>,
  > = K extends keyof EmitterEvents<T>
  ? EmitterEvents<T>[K]
  : K extends keyof T
  ? ValidArgs<T[K]>
  : never;

/**
 * Valid event listener args from `T`.
 */
export type ValidArgs<T> = T extends unknown[] ? T : never;

/**
 * Event listener type.
 */
export type EventListener<T, K extends keyof Events<T>> = (
  ...args: ValidEventArgs<T, K>
) => void;

/**
 * Wrap `fn` for uniqueness, avoids removing different `fn` in stack.
 */
export type $Wrap<T> = { fn: T };

/**
 * Create an `off` function given an input.
 */
function add<T>(stack: Set<T>, value: T): () => boolean {
  stack.add(value);
  return function off() {
    return stack.delete(value);
  };
}

/**
 * Emit an event.
 */
function emitApply<T, K extends keyof Events<T>>(
  stack: Set<$Wrap<EventListener<T, K>>>,
  ...args: ValidEventArgs<T, K>
): void {
  if (stack) {
    for (const { fn } of stack) {
      fn(...args);
    }
  }
}

/**
 * Helper to listen to an event once only.
 */
export function onceAdd<T, K extends keyof Events<T>>(
  events: EventEmitter<T>,
  type: K,
  callback: EventListener<T, K>,
) {
  const off = events.on(type, (...args) => {
    off();
    return callback(...args);
  });

  return off;
}

/**
 * Type-safe event emitter.
 * - https://github.com/serviejs/events
 * - https://nodejs.org/api/events.html#class-eventemitter
 */
export class EventEmitter<T = any> {
  /** { type: Set<func> } */
  listeners: {
    [K in keyof Events<T>]: Set<$Wrap<EventListener<T, K>>>;
  } = Object.create(null);

  once(type, listener) {
    onceAdd(this, type, listener);
    return this;
  }

  on<K extends keyof Events<T>>(type: K, fn: EventListener<T, K>) {
    const listeners = (this.listeners[type] =
      this.listeners[type] || new Set());
    return add(listeners, { fn });
  }

  addListener(type, listener) {
    return this.on(type, listener)
  }

  off(type, fnListener) {
    const listeners = this.listeners[type];
    if (!listeners || (listeners instanceof Set && !listeners.size)) {
      return;
    }
    const newListeners = Array.from(listeners).filter(
      ({ fn }) => fn !== fnListener,
    );
    this.listeners[type] = new Set(newListeners);
  }

  removeListener(type, listener) {
    this.off(type, listener)
  }

  emit<K extends keyof T>(type: K, ...args: ValidEventArgs<T, K>) {
    emitApply(this.listeners[type], ...args);
    // 为了方便调试，当在外部注册 ALL_EVENTS 事件f1后，当触发type类型事件时也会触发f1
    emitApply(this.listeners[ALL_EVENTS], { type, args });
  }
}
