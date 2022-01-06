import { EditorState } from 'prosemirror-state';
import React from 'react';

import * as keymaps from '../../keymaps';
import { QuickInsertActionInsert } from '../../provider-factory/quick-insert-provider';
import { blockquote } from '../../schema/nodes';
import { EditorPlugin, PMPluginFactory } from '../../types';
import WithPluginState from '../../ui/hocs/WithPluginState';
import IconQuote from '../quick-insert/assets/code';
// import { getToolbarConfig } from './toolbar';
import { keymapPlugin } from './pm-plugins/keymap';
import {
  blockQuotePluginFactory,
  blockquotePluginKey,
} from './pm-plugins/main';

export interface BlockQuoteOptions {}

export const blockQuotePlugin = (
  options: BlockQuoteOptions = {},
): EditorPlugin => ({
  name: 'blockquote',

  nodes() {
    return [{ name: 'blockquote', node: blockquote }];
  },

  pmPlugins() {
    const plugins: { name: string; plugin: PMPluginFactory }[] = [
      {
        name: 'blockquote',
        plugin: ({
          dispatch,
          // providerFactory,
          portalProviderAPI,
          eventDispatcher,
        }) =>
          blockQuotePluginFactory(
            dispatch,
            // providerFactory,
            portalProviderAPI,
            eventDispatcher,
            options,
          ),
      },
      { name: 'blockquoteKeyMap', plugin: () => keymapPlugin() },
    ];
    return plugins;
  },

  // primaryToolbarComponent({
  //   editorView,
  //   popupsMountPoint,
  //   popupsBoundariesElement,
  //   popupsScrollableElement,
  //   toolbarSize,
  //   disabled,
  //   isToolbarReducedSpacing,
  //   eventDispatcher,
  // }) {
  //   return (
  //     <WithPluginState
  //       editorView={editorView}
  //       eventDispatcher={eventDispatcher}
  //       plugins={{
  //         pluginState: blockquotePluginKey,
  //       }}
  //       render={({ pluginState }) => {
  //         return (
  //           <ToolbarBlockType
  //             isDisabled={disabled}
  //             isReducedSpacing={isToolbarReducedSpacing}
  //             setBlockType={boundSetBlockType}
  //             pluginState={pluginState}
  //             popupsMountPoint={popupsMountPoint}
  //             popupsBoundariesElement={popupsBoundariesElement}
  //             popupsScrollableElement={popupsScrollableElement}
  //           />
  //         );
  //       }}
  //     />
  //   );
  // },

  pluginsOptions: {
    quickInsert: [
      {
        id: 'blockquote',
        title: 'Quote',
        description: 'Quote some text',
        priority: 1300,
        keyshortcut: keymaps.tooltip(keymaps.toggleBlockQuote),
        icon: () => <IconQuote label='Quote' />,
        action(insert: QuickInsertActionInsert, state: EditorState<any>) {
          const tr = insert(
            state.schema.nodes.blockquote.createChecked(
              {},
              state.schema.nodes.paragraph.createChecked(),
            ),
          );
          return tr;
        },
      },
    ],
    // floatingToolbar: getToolbarConfig(options.allowCopyToClipboard),
  },
});
