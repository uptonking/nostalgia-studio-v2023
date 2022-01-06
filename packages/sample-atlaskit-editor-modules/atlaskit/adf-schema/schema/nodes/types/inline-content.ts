import type {
  AnnotationMarkDefinition as Annotation,
  CodeDefinition as Code,
  EmDefinition as Em,
  LinkDefinition as Link,
  StrikeDefinition as Strike,
  StrongDefinition as Strong,
  SubSupDefinition as SubSup,
  TextColorDefinition as TextColor,
  UnderlineDefinition as Underline,
} from '../../marks';
import type { DateDefinition as Date } from '../date';
import type { EmojiDefinition as Emoji } from '../emoji';
import type { HardBreakDefinition as HardBreak } from '../hard-break';
import type { InlineCardDefinition as InlineCard } from '../inline-card';
import type {
  InlineExtensionWithMarksDefinition as InlineExtensionWithMark,
  InlineExtensionDefinition as InlineExtensionWithoutMark,
} from '../inline-extension';
import type { MentionDefinition as Mention } from '../mention';
import type { PlaceholderDefinition as Placeholder } from '../placeholder';
import type { StatusDefinition as Status } from '../status';
import type { TextDefinition as Text } from '../text';
import type { MarksObject } from './mark';

/**
 * @name formatted_text_inline_node
 */
export type InlineFormattedText = Text &
  MarksObject<
    Link | Em | Strong | Strike | SubSup | Underline | TextColor | Annotation
  >;
/**
 * @name link_text_inline_node
 */
export type InlineLinkText = Text & MarksObject<Link>;
/**
 * @name code_inline_node
 */
export type InlineCode = Text & MarksObject<Code | Link | Annotation>;

/**
 * @name atomic_inline_node
 */
export type InlineAtomic =
  | HardBreak
  | Mention
  | Emoji
  | InlineExtensionWithoutMark
  | Date
  | Placeholder
  | InlineCard
  | Status;
/**
 * @name inline_node
 */
export type Inline =
  | InlineFormattedText
  | InlineCode
  | InlineExtensionWithMark
  | InlineAtomic;
