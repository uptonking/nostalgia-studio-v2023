import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';

import { doc, paragraph, text } from '../../schema/nodes';
import { EditorPlugin, PMPluginFactory } from '../../types';
import { createParagraphNear, splitBlock } from './commands/general';

// import { keymap } from '../../utils/keymap';

export interface BasePluginOptions {}

/** 提供了基本节点nodes的schema定义，包括doc/text/p，不包括marks；
 * 设置了基本快捷键，包括undo-redo/baseKeymap/自定义
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
            'Ctrl-Alt-p': createParagraphNear,
            'Ctrl-Alt-s': splitBlock,
          }),
      },
    ];

    return plugins;
  },
  nodes() {
    return [
      { name: 'doc', node: doc },
      { name: 'text', node: text },
      { name: 'paragraph', node: paragraph },
    ];
  },
});
