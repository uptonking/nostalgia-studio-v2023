import type { NodeSpec } from 'prosemirror-model';

import type { BulletListDefinition as BulletList } from './bullet-list';
import type { CodeBlockDefinition as CodeBlock } from './code-block';
import type { MediaSingleDefinition as MediaSingle } from './media-single';
import type { OrderedListDefinition as OrderedList } from './ordered-list';
import type { ParagraphDefinition as Paragraph } from './paragraph';

export interface ListItemArray
  extends Array<
    Paragraph | OrderedList | BulletList | MediaSingle | CodeBlock
  > {
  0: Paragraph | MediaSingle | CodeBlock;
}

/**
 * @name listItem_node
 */
export interface ListItemDefinition {
  type: 'listItem';
  /**
   * @minItems 1
   */
  content: ListItemArray;
}

export const listItem: NodeSpec = {
  content:
    '(paragraph | mediaSingle | codeBlock) (paragraph | bulletList | orderedList | mediaSingle | codeBlock)*',
  marks: 'link unsupportedMark unsupportedNodeAttribute',
  defining: true,
  selectable: false,
  parseDOM: [{ tag: 'li' }],
  toDOM() {
    return ['li', 0];
  },
};
