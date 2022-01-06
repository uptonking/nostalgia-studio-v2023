import { MarkSpec } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

import {
  EditorConfig,
  EditorPlugin,
  PMPluginCreateConfig,
  PluginsOptions,
} from '../types';
import { sortByOrder } from './ranks';

export function sortByRank(a: { rank: number }, b: { rank: number }): number {
  return a.rank - b.rank;
}

export function fixExcludes(marks: { [key: string]: MarkSpec }): {
  [key: string]: MarkSpec;
} {
  const markKeys = Object.keys(marks);
  const markGroups = new Set(markKeys.map((mark) => marks[mark].group));

  markKeys.forEach((markKey) => {
    const mark = marks[markKey];
    if (mark.excludes) {
      mark.excludes = mark.excludes
        .split(' ')
        .filter((group) => markGroups.has(group))
        .join(' ');
    }
  });
  return marks;
}

/** 遍历所有输入项，将EditorPlugins的配置数据转换成prosemirror可用的plugins、nodes、marks */
export function processPluginsList(plugins: EditorPlugin[]): EditorConfig {
  /**
   * First pass to collect pluginsOptions
   */
  const pluginsOptions = plugins.reduce<PluginsOptions>((acc, plugin) => {
    if (plugin.pluginsOptions) {
      Object.keys(plugin.pluginsOptions).forEach((pluginName) => {
        if (!acc[pluginName]) {
          acc[pluginName] = [];
        }
        acc[pluginName].push(plugin.pluginsOptions![pluginName]);
      });
    }

    return acc;
  }, {});
  /**
   * Process plugins
   */
  return plugins.reduce<EditorConfig>(
    (acc, plugin) => {
      if (plugin.pmPlugins) {
        acc.pmPlugins.push(
          ...plugin.pmPlugins(
            plugin.name ? pluginsOptions[plugin.name] : undefined,
          ),
        );
      }

      if (plugin.nodes) {
        acc.nodes.push(...plugin.nodes());
      }

      if (plugin.marks) {
        acc.marks.push(...plugin.marks());
      }

      return acc;
    },
    {
      nodes: [],
      marks: [],
      pmPlugins: [],
    },
  );
}

/** 计算出prosemirror可用的plugins */
export function createPMPlugins(config: PMPluginCreateConfig): Plugin[] {
  const { editorConfig, ...rest } = config;
  return editorConfig.pmPlugins
    .sort(sortByOrder('plugins'))
    .map(({ plugin }) => plugin(rest))
    .filter((plugin): plugin is Plugin => typeof plugin !== 'undefined');
}
