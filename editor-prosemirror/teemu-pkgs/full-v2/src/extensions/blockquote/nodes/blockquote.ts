import { NodeSpec } from 'prosemirror-model';
import type { IExtensionSchema } from '../../Extension';

export const blockquote: NodeSpec = {
  content: 'paragraph+',
  group: 'block',
  defining: true,
  selectable: false,
  attrs: {
    class: { default: '' },
  },
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0];
  },
};

export const blockQuoteSchema: IExtensionSchema = {
  nodes: { blockquote: blockquote },
};
