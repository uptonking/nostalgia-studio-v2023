import { EventDispatcher, PluginKey } from '../core';

interface PluginState {
  [key: string]: any;
}

/** 基于EventDispatcher的插件注册及执行 */
export class PluginsProvider {
  dispatcher: EventDispatcher = new EventDispatcher();

  /** 触发执行某个插件的所有cb函数 */
  publish(pluginKey: PluginKey, nextPluginState: PluginState) {
    this.dispatcher.emit(pluginKey.name, nextPluginState);
  }

  /** 添加 <插件名，回调函数> 到映射表 */
  subscribe(pluginKey: PluginKey, cb: (data: any) => void) {
    this.dispatcher.on(pluginKey.name, cb);
  }

  unsubscribe(pluginKey: PluginKey, cb: (data: any) => void) {
    this.dispatcher.off(pluginKey.name, cb);
  }
}
