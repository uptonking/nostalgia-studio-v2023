import { keymap } from 'prosemirror-keymap';
import { type Plugin } from 'prosemirror-state';
import { bindKeymapWithCommand, toggleBlockQuote } from '../../../keymaps';
import { createNewBlockQuote } from '../commands';

export function keymapPlugin(): Plugin {
  const keymapObj = {};

  bindKeymapWithCommand(
    toggleBlockQuote.common!,
    createNewBlockQuote(),
    keymapObj,
  );

  return keymap(keymapObj);
}
