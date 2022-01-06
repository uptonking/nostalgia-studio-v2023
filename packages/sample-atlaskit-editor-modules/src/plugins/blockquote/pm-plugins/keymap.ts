import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';

import { bindKeymapWithCommand, toggleBlockQuote } from '../../../keymaps';
import { createNewBlockQuote } from '../commands';

/** 可以创建keymap相关的pm-plugin的工厂方法 */
export function keymapPlugin(): Plugin {
  const keymapObj = {};

  bindKeymapWithCommand(
    // 默认 ctrl+alt+b
    toggleBlockQuote.common!,
    createNewBlockQuote(),
    keymapObj,
  );

  return keymap(keymapObj);
}
