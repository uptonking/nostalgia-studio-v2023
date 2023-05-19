import type { DefaultEvents, Emitter, EventsMap } from './index.d';

export * from './index.d';

export const createNanoEvents = <
  Events extends EventsMap = DefaultEvents,
>(): Emitter<Events> => ({
  events: {},
  emit(event, ...args) {
    let callbacks = this.events[event] || [];
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args);
    }
  },
  on(event, cb) {
    this.events[event]?.push(cb) || (this.events[event] = [cb]);
    return () => {
      this.events[event] = this.events[event]?.filter((i) => cb !== i);
    };
  },
});
