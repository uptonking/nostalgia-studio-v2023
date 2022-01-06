import { PluginKey } from 'prosemirror-state';

export interface Listeners {
  [name: string]: Set<Listener>;
}
export type Listener<T = any> = (data: T) => void;

/** 一个自定义方法，能执行eventName对应的所有注册过得cb函数 */
export type Dispatch<T = any> = (
  eventName: PluginKey | string,
  data: T,
) => void;

// https://bitbucket.org/atlassian/atlassian-frontend-mirror/src/master/editor/editor-core/src/event-dispatcher/index.ts
/** 标准的事件管理器，基于pubsub模式，使用的是映射表存储 */
export class EventDispatcher<T = any> {
  /** 映射表：事件名，及其对应的事件处理函数集合Set */
  private listeners: Listeners = {};

  /** 注册事件处理函数cb到event名称对应的Set集合 */
  on(event: string, cb: Listener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event].add(cb);
  }

  /** 从event名称对应的Set集合中移除cb函数 */
  off(event: string, cb: Listener<T>): void {
    if (!this.listeners[event]) {
      return;
    }

    if (this.listeners[event].has(cb)) {
      this.listeners[event].delete(cb);
    }
  }

  /** 遍历并执行event名称对应的所有事件处理函数，传入data作为参数 */
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
 * 高阶函数，返回的函数能执行event名称对应的所有注册过的事件处理函数。
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

    // 执行event名称对应的所有注册过的事件处理函数
    eventDispatcher.emit(event, data);
  };
}
