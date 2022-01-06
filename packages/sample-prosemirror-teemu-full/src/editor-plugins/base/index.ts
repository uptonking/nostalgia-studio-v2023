import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';

import { EditorPlugin, PMPluginFactory } from '../../core/types';
import { em, strong } from '../../schema/marks';
import { doc, paragraph, pmBlockquote, text } from '../../schema/nodes';
import { createNewPmBlockQuote, splitBlock } from './commands/general';
import { basePluginFactory, basePluginKey } from './pm-plugins/main';

// import { keymap } from '../../utils/keymap';

export { basePluginKey } from './pm-plugins/main';
export type { BaseState } from './pm-plugins/main';
export interface BasePluginOptions {}

/** 提供编辑器基本功能的EditorPlugin，粒度可以继续细分；
 * 提供了baseKeymap、undo/redo功能，
 * 提供了几种基本的nodes和marks：doc/p/blockquote/text、em/strong
 */
export const basePlugin = (options?: BasePluginOptions): EditorPlugin => ({
  name: 'base',

  pmPlugins() {
    const plugins: { name: string; plugin: PMPluginFactory }[] = [
      { name: 'history', plugin: () => history() },
      { name: 'baseKeyMap', plugin: () => keymap(baseKeymap) },
      {
        name: 'otherKeyMap',
        plugin: () =>
          keymap({
            // 'Ctrl-Alt-b': createNewPmBlockQuote, // ctrl-alt-b是创建nodeView对应的blockquote，不在这里实现
            'Ctrl-Alt-p': createNewPmBlockQuote,
            'Ctrl-Alt-s': splitBlock,
          }),
      },
      {
        name: 'base',
        plugin: ({ portalProvider, pluginsProvider }) =>
          basePluginFactory(portalProvider, pluginsProvider, options),
      },
    ];

    return plugins;
  },
  nodes() {
    return [
      { name: 'doc', node: doc },
      { name: 'paragraph', node: paragraph },
      { name: 'pmBlockquote', node: pmBlockquote },
      { name: 'text', node: text },
    ];
  },
  marks() {
    return [
      { name: 'em', mark: em },
      { name: 'strong', mark: strong },
    ];
  },
});
