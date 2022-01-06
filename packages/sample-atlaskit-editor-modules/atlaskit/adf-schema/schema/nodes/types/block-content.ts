import type { BlockCardDefinition as BlockCard } from '../block-card';
import type { BlockQuoteDefinition as Blockquote } from '../blockquote';
import type {
  BodiedExtensionDefinition as BodiedExtension,
  BodiedExtensionWithMarksDefinition as BodiedExtensionWithMarks,
} from '../bodied-extension';
import type { BulletListDefinition as BulletList } from '../bullet-list';
import type { CodeBlockDefinition as CodeBlock } from '../code-block';
import type { DecisionListDefinition as DecisionList } from '../decision-list';
import type { EmbedCardDefinition as EmbedCard } from '../embed-card';
import type { ExpandDefinition as Expand } from '../expand';
import {
  ExtensionDefinition as Extension,
  ExtensionWithMarksDefinition as ExtensionWithMarks,
} from '../extension';
import {
  HeadingDefinition as Heading,
  HeadingWithMarksDefinition as HeadingWithMarks,
} from '../heading';
import type { MediaGroupDefinition as MediaGroup } from '../media-group';
import type { MediaSingleDefinition as MediaSingle } from '../media-single';
import type { OrderedListDefinition as OrderedList } from '../ordered-list';
import type { PanelDefinition as Panel } from '../panel';
import type {
  ParagraphDefinition as Paragraph,
  ParagraphWithAlignmentDefinition as ParagraphWithMarks,
} from '../paragraph';
import type { RuleDefinition as Rule } from '../rule';
import type { TableDefinition as Table } from '../tableNodes';
import type { TaskListDefinition as TaskList } from '../task-list';

// NOTE: BlockContent is only being used by layoutColumn now.

/**
 * @name block_content
 */
export type BlockContent =
  | Panel
  | Paragraph
  | ParagraphWithMarks
  | Blockquote
  | OrderedList
  | BulletList
  | Rule
  | Heading
  | HeadingWithMarks
  | CodeBlock
  | MediaGroup
  | MediaSingle
  | DecisionList
  | TaskList
  | Table
  | Expand
  | Extension
  | ExtensionWithMarks
  | BodiedExtension
  | BodiedExtensionWithMarks
  | BlockCard
  | EmbedCard;
