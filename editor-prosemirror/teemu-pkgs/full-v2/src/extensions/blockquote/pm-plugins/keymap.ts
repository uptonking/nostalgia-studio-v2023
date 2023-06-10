import { keymap } from 'prosemirror-keymap';
import { type Plugin } from 'prosemirror-state';

import { keymaps } from '../../../core';
import { createNewBlockQuote } from '../commands';

const { bindKeymapWithCommand, toggleBlockQuote } = keymaps;

export function keymapPlugin(): Plugin {
  const keymapObj = {};

  bindKeymapWithCommand(
    toggleBlockQuote.common!,
    createNewBlockQuote(),
    keymapObj,
  );

  return keymap(keymapObj);
}
