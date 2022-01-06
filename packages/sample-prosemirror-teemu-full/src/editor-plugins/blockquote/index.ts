import { EditorState } from 'prosemirror-state';

import * as keymaps from '../../core/keymaps';
import { EditorPlugin, PMPluginFactory } from '../../core/types';
import { NodeViewProps } from '../../react/ReactNodeView';
import { blockquote } from '../../schema/nodes';
import { keymapPlugin } from './pm-plugins/keymap';
import {
  blockQuotePluginFactory,
  blockquotePluginKey,
} from './pm-plugins/main';

export interface BlockQuoteOptions {}
export interface IViewProps {
  options?: BlockQuoteOptions;
}
export type UIProps = NodeViewProps<IViewProps, IBlockQuoteAttrs>;
export interface IBlockQuoteAttrs {
  size: number;
}

/** 封装了blockquote功能的EditorPlugin，提供了基于react组件的nodeViews */
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
        plugin: ({ portalProvider, pluginsProvider }) =>
          // 创建一个pm-Plugin对象，设置了nodeViews
          blockQuotePluginFactory(portalProvider, pluginsProvider, options),
      },
      // 提供创建新blockquote的快捷键
      { name: 'blockquoteKeyMap', plugin: () => keymapPlugin() },
    ];
    return plugins;
  },

  pluginsOptions: {},
});
