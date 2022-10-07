import { EditorState } from 'prosemirror-state';

import { Extension, IExtensionSchema } from '../Extension';
import { blockquote, blockQuoteSchema } from './nodes/blockquote';
import { keymapPlugin } from './pm-plugins/keymap';
import { blockQuotePluginFactory } from './pm-plugins/main';
import { blockquotePluginKey, getPluginState } from './pm-plugins/state';

export interface BlockQuoteExtensionProps {}

export class BlockQuoteExtension extends Extension<BlockQuoteExtensionProps> {
  get name() {
    return 'blockquote' as const;
  }

  get schema() {
    return blockQuoteSchema;
  }

  static get pluginKey() {
    return blockquotePluginKey;
  }

  static getPluginState(state: EditorState) {
    return getPluginState(state);
  }

  get plugins() {
    return [
      {
        name: 'blockquote',
        plugin: () => blockQuotePluginFactory(this.ctx, this.props),
      },
      { name: 'blockquoteKeyMap', plugin: () => keymapPlugin() },
    ];
  }
}
