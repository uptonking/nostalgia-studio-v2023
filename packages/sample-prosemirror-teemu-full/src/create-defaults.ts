import { EditorProps } from './Editor';
import { processPluginsList } from './core/create/create-plugins';
import { createSchema } from './core/create/create-schema';
import { Preset } from './core/create/preset';
import { EditorPlugin } from './core/types';
import { basePlugin, blockQuotePlugin } from './editor-plugins';

/** 提供编辑器内置的plugins，这里只添加了basePlugin、blockQuotePlugin */
export function createDefaultEditorPlugins(
  props: EditorProps,
  prevProps?: EditorProps,
): EditorPlugin[] {
  const preset = new Preset<EditorPlugin>();

  preset.add(basePlugin);

  preset.add(blockQuotePlugin);

  return preset.getEditorPlugins();
}

/** 从所有plugins中计算出pm-schema对象 */
export function createDefaultSchema() {
  const editorProps: EditorProps = {};
  const editorPlugins = createDefaultEditorPlugins(editorProps);
  const config = processPluginsList(editorPlugins);
  const schema = createSchema(config);
  return schema;
}
