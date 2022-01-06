import { PluginKey } from 'prosemirror-state';

export type Listener<T = any> = (data: T) => void;
export interface Listeners {
  [name: string]: Set<Listener>;
}
export type Dispatch<T = any> = (
  eventName: PluginKey | string,
  data: T,
) => void;

// https://bitbucket.org/atlassian/atlassian-frontend-mirror/src/master/editor/editor-core/src/event-dispatcher/index.ts
/**
 * 标准的发布订阅事件模式
 */
export class EventDispatcher<T = any> {
  /** 保存所有 <事件名, 事件名对应cb函数> 的映射表 */
  private listeners: Listeners = {};

  on(event: string, cb: Listener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event].add(cb);
  }

  off(event: string, cb: Listener<T>): void {
    if (!this.listeners[event]) {
      return;
    }

    if (this.listeners[event].has(cb)) {
      this.listeners[event].delete(cb);
    }
  }

  /** 遍历执行某个event名对应的的所有cb函数，data作为cb函数的参数 */
  emit(event: string, data: T): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach((cb) => cb(data));
  }

  destroy(): void {
    this.listeners = {};
  }
}

/**
 * Creates a dispatch function that can be called inside ProseMirror Plugin
 * to notify listeners about that plugin's state change.
 */
export function createDispatch<T>(
  eventDispatcher: EventDispatcher<T>,
): Dispatch<T> {
  return (eventName: PluginKey | string, data: T) => {
    if (!eventName) {
      throw new Error('event name is required!');
    }

    const event =
      typeof eventName === 'string'
        ? eventName
        : (eventName as PluginKey & { key: string }).key;
    eventDispatcher.emit(event, data);
  };
}
