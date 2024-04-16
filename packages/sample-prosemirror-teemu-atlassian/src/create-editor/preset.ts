/**
 * EditorPlugins编辑插件管理器，提供了添加、删除、读取等方法
 */
export class Preset<T extends { name: string }> {
  /** 数组：存放所有EditorPlugins配置数据的数组 */
  private plugins: PluginsPreset;

  constructor() {
    this.plugins = [];
  }

  add<PluginFactory>(plugin: PluginConfig<PluginFactory, T>): this {
    this.plugins.push(plugin);
    return this;
  }

  private removeExcludedPlugins(plugins: Array<T>, excludes?: Set<string>) {
    if (excludes) {
      return plugins.filter((plugin) => !plugin || !excludes.has(plugin.name));
    }
    return plugins;
  }

  has(plugin: () => T): boolean {
    return this.plugins.some((pluginPreset) => {
      if (Array.isArray(pluginPreset)) {
        return pluginPreset[0] === plugin;
      }

      return pluginPreset === plugin;
    });
  }

  /** 获取所有满足条件的配置插件，可以去除参数中指定的部分 */
  getEditorPlugins(excludes?: Set<string>) {
    const editorPlugins = this.processEditorPlugins();
    return this.removeExcludedPlugins(editorPlugins, excludes);
  }

  /** 利用缓存读取所有的EditorPlugins，计算出对应的prosemirror-plugin */
  private processEditorPlugins() {
    /** 缓存映射表：创建插件的工厂方法，对应的配置对象 */
    const cache = new Map();
    this.plugins.forEach((pluginEntry) => {
      if (Array.isArray(pluginEntry)) {
        const [fn, options] = pluginEntry;
        cache.set(fn, options);
      } else {
        /**
         * Prevent usage of same plugin twice without override.
         * [
         *  plugin1,
         *  [plugin1, { option1: value }],
         *  plugin1, // This will throw
         * ]
         */
        if (cache.has(pluginEntry) && cache.get(pluginEntry) === undefined) {
          throw new Error(`${pluginEntry} is already included!`);
        }

        // 默认的配置对象为undefined
        cache.set(pluginEntry, undefined);
      }
    });

    const plugins: Array<T> = [];
    cache.forEach((options, fn) => {
      plugins.push(fn(options));
    });

    return plugins;
  }
}

/** type定义：PluginConfig的数组 */
export type PluginsPreset = Array<PluginConfig<any, any>>;

/**
 * Type for Editor Preset's plugin configuration.
 *
 * Possible configurations:
 * – () => EditorPlugin
 * – (options: any) => EditorPlugin
 * – (options?: any) => EditorPlugin
 *
 * Usage:
 * – preset.add(plugin)
 * – preset.add([plugin])
 * – preset.add([plugin, options])
 *
 *
 * Type:
 * – Plugin with required arguments, matches `() => EditorPlugin` too,
 *   because no arguments has type `unknown`.
 *
 * IF (Args: any) => Editor Plugin:
 *    IF Args === unknown
 *       preset.add(plugin) || preset.add([plugin])
 *    ELSE
 *       IF Args are Optional
 *          preset.add(plugin) | preset.add([plugin]) | preset.add([plugin, options])
 *       ELSE [Args are required]
 *          preset.add([plugin, options])
 * ELSE
 *   never
 */
export type PluginConfig<PluginFactory, T> = PluginFactory extends (
  args: infer Args,
) => T
  ? Exclude<unknown, Args> extends never
    ? PluginFactory | [PluginFactory]
    : Exclude<Args, Exclude<Args, undefined>> extends never
      ? [PluginFactory, Args]
      : PluginFactory | [PluginFactory] | [PluginFactory, Args]
  : never;
