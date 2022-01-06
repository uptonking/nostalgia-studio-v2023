import * as React from 'react';

import type { CardOptions } from '../../../../editor-common';
import type { AnnotationProviders } from '../../../plugins/annotation';
import basePlugin, { BasePluginOptions } from '../../../plugins/base';
import blockTypePlugin from '../../../plugins/block-type';
import type { BlockTypePluginOptions } from '../../../plugins/block-type/types';
import clipboardPlugin from '../../../plugins/clipboard';
import codeBlockPlugin from '../../../plugins/code-block';
import type { CodeBlockOptions } from '../../../plugins/code-block/types';
import editorDisabledPlugin from '../../../plugins/editor-disabled';
import fakeTextCursorPlugin from '../../../plugins/fake-text-cursor';
import featureFlagsContextPlugin from '../../../plugins/feature-flags-context';
import floatingToolbarPlugin from '../../../plugins/floating-toolbar';
import hyperlinkPlugin from '../../../plugins/hyperlink';
import type { PastePluginOptions } from '../../../plugins/paste';
import pastePlugin from '../../../plugins/paste';
import type { PlaceholderPluginOptions } from '../../../plugins/placeholder';
import quickInsertPlugin from '../../../plugins/quick-insert';
import type { QuickInsertPluginOptions } from '../../../plugins/quick-insert';
import selectionPlugin from '../../../plugins/selection';
import type { SelectionPluginOptions } from '../../../plugins/selection/types';
import textFormattingPlugin from '../../../plugins/text-formatting';
import type { TextFormattingOptions } from '../../../plugins/text-formatting/types';
import typeAheadPlugin from '../../../plugins/type-ahead';
import undoRedoPlugin from '../../../plugins/undo-redo';
import unsupportedContentPlugin from '../../../plugins/unsupported-content';
import widthPlugin from '../../../plugins/width';
import type { EditorPlugin } from '../../../types/editor-plugin';
import { EditorProps, PresetProvider } from '../Editor';
import { Preset } from './preset';
import type { EditorPresetProps } from './types';

// import clearMarksOnChangeToEmptyDocumentPlugin from '../../../plugins/clear-marks-on-change-to-empty-document';
// import placeholderPlugin  from '../../../plugins/placeholder';
// import annotationPlugin from '../../../plugins/annotation';
// import submitEditorPlugin from '../../../plugins/submit-editor';
// import { CreateUIAnalyticsEvent } from '@atlaskit/analytics-next';

interface EditorPresetDefaultProps {
  children?: React.ReactNode;
}

export type DefaultPresetPluginOptions = {
  paste: PastePluginOptions;
  base?: BasePluginOptions;
  blockType?: BlockTypePluginOptions;
  placeholder?: PlaceholderPluginOptions;
  textFormatting?: TextFormattingOptions;
  submitEditor?: EditorProps['onSave'];
  annotationProviders?: AnnotationProviders;
  quickInsert?: QuickInsertPluginOptions;
  codeBlock?: CodeBlockOptions;
  selection?: SelectionPluginOptions;
  cardOptions?: CardOptions;
  createAnalyticsEvent?: any;
};

/**
 * 创建编辑器内置基础插件集合的方法。
 * Note: The order that presets are added determines
 * their placement in the editor toolbar
 */
export function createDefaultPreset(
  options: EditorPresetProps & DefaultPresetPluginOptions,
) {
  // console.log(';;createDefaultPreset-options, ', options);
  const preset = new Preset<EditorPlugin>();
  preset.add([pastePlugin as any, options.paste]);
  preset.add(clipboardPlugin);
  preset.add([basePlugin, options.base] as any);
  if (options.featureFlags?.undoRedoButtons) {
    preset.add(undoRedoPlugin);
  }
  preset.add([blockTypePlugin as any, options.blockType]);
  // preset.add([placeholderPlugin, options.placeholder]);
  // preset.add(clearMarksOnChangeToEmptyDocumentPlugin);

  // if (options.annotationProviders) {
  //   preset.add([annotationPlugin, options.annotationProviders]);
  // }

  preset.add([hyperlinkPlugin as any, options.cardOptions]);
  preset.add([textFormattingPlugin as any, options.textFormatting]);
  preset.add(widthPlugin);
  preset.add([quickInsertPlugin as any, options.quickInsert]);
  preset.add([
    typeAheadPlugin as any,
    { createAnalyticsEvent: options.createAnalyticsEvent },
  ]);
  preset.add(unsupportedContentPlugin);
  preset.add(editorDisabledPlugin);
  // preset.add([submitEditorPlugin, options.submitEditor]);
  preset.add(fakeTextCursorPlugin);
  preset.add(floatingToolbarPlugin);
  preset.add([featureFlagsContextPlugin as any, options.featureFlags || {}]);
  preset.add([selectionPlugin as any, options.selection]);
  preset.add([codeBlockPlugin as any, options.codeBlock]);
  return preset;
}

/** 返回包含编辑器内置基础插件集合的数组 */
export function useDefaultPreset(
  props: EditorPresetProps & DefaultPresetPluginOptions,
) {
  const preset = createDefaultPreset(props);
  return [preset];
}

/** 将编辑器内置基础插件集合的数据放在provider中传下去 */
export function EditorPresetDefault(
  props: EditorPresetDefaultProps &
    EditorPresetProps &
    DefaultPresetPluginOptions,
) {
  const [preset] = useDefaultPreset(props);
  const plugins = preset.getEditorPlugins();
  return <PresetProvider value={plugins}>{props.children}</PresetProvider>;
}
