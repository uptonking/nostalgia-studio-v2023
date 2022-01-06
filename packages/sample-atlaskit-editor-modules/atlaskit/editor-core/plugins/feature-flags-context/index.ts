import { EditorState, Plugin, PluginKey } from 'prosemirror-state';

import type { EditorPlugin } from '../../types';
import type { FeatureFlags } from '../../types/feature-flags';
import { useEditorContext } from '../../ui/EditorContext';

export const pluginKey = new PluginKey('featureFlagsContextPlugin');

const featureFlagsContextPlugin = (
  featureFlags: FeatureFlags = {},
): EditorPlugin => ({
  name: 'featureFlagsContext',
  pmPlugins() {
    return [
      {
        name: 'featureFlagsContext',
        plugin: () =>
          new Plugin({
            key: pluginKey,
            state: {
              init: (): FeatureFlags => ({ ...featureFlags }),
              apply: (_, pluginState) => pluginState,
            },
          }),
      },
    ];
  },
});

/** 实际执行 pluginKey.getState(state) */
export const getFeatureFlags = (state: EditorState): FeatureFlags =>
  pluginKey.getState(state);

export const useFeatureFlags = (): FeatureFlags | undefined => {
  const { editorActions } = useEditorContext();
  const editorView = editorActions?._privateGetEditorView();
  return editorView?.state ? pluginKey.getState(editorView.state) : undefined;
};

export default featureFlagsContextPlugin;
