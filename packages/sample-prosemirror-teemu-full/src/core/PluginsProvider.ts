import { PluginKey } from './pm';
import { EventDispatcher } from './utils/EventDispatcher';

interface PluginState {
  [key: string]: any;
}

/** 事件管理中心 */
export class PluginsProvider {
  dispatcher: EventDispatcher = new EventDispatcher();

  // 执行映射表中pluginKey.name对应的所有cb函数
  publish(pluginKey: PluginKey, nextPluginState: PluginState) {
    this.dispatcher.emit(pluginKey.name, nextPluginState);
  }

  // 注册cb到映射表
  subscribe(pluginKey: PluginKey, cb: (data: any) => void) {
    this.dispatcher.on(pluginKey.name, cb);
  }

  // 从映射表中移除name对应的cb
  unsubscribe(pluginKey: PluginKey, cb: (data: any) => void) {
    this.dispatcher.off(pluginKey.name, cb);
  }
}
