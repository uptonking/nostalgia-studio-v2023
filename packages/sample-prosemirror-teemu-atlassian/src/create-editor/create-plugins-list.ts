import { EditorProps } from '../Editor';
import {
  basePlugin,
  blockQuotePlugin,
  quickInsertPlugin,
  typeAheadPlugin,
} from '../plugins';
import { EditorPlugin } from '../types';
import { Preset } from './preset';

/**
 * 添加内置的editorPlugins，包括 base/blockquote/quickInsert/typeAhead。
 * Maps EditorProps to EditorPlugins.
 */
export function createPluginsList(
  props: EditorProps,
  prevProps?: EditorProps,
): EditorPlugin[] {
  // 创建一个空的配置插件集合
  const preset = new Preset<EditorPlugin>();

  preset.add(basePlugin);

  preset.add(blockQuotePlugin);

  preset.add(quickInsertPlugin);

  preset.add(typeAheadPlugin);

  return preset.getEditorPlugins();
}
