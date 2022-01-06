import type { NodeSpec } from 'prosemirror-model';

import type { DateDefinition as Date } from './date';
import type { EmojiDefinition as Emoji } from './emoji';
import type { HardBreakDefinition as HardBreak } from './hard-break';
import type { InlineCardDefinition as InlineCard } from './inline-card';
import type { MentionDefinition as Mention } from './mention';
import type { PlaceholderDefinition as Placeholder } from './placeholder';
import type { StatusDefinition as Status } from './status';
import type { InlineCode, InlineFormattedText } from './types/inline-content';

/**
 * @stage 0
 * @name caption_node
 */
export interface CaptionDefinition {
  type: 'caption';
  /**
   * @minItems 0
   */
  content: Array<
    | InlineFormattedText
    | InlineCode
    | HardBreak
    | Mention
    | Emoji
    | Date
    | Placeholder
    | InlineCard
    | Status
  >;
}

export const caption: NodeSpec = {
  content: '(text|hardBreak|mention|emoji|date|placeholder|inlineCard|status)*',
  isolating: true,
  marks: '_',
  selectable: false,
  parseDOM: [
    {
      tag: 'figcaption[data-caption]',
    },
  ],
  toDOM(node) {
    const attrs: Record<string, string> = {
      'data-caption': 'true',
    };

    return ['figcaption', attrs, 0];
  },
};
