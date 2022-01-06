import type { NodeSpec } from 'prosemirror-model';

import type { CodeBlockWithMarksDefinition as CodeBlockWithMarks } from './code-block';
import type { ExpandWithBreakoutDefinition as ExpandWithBreakout } from './expand';
import type { LayoutSectionDefinition as LayoutSection } from './layout-section';
import type { ParagraphWithIndentationDefinition } from './paragraph';
import type { BlockContent } from './types/block-content';

/**
 * @name doc_node
 */
export interface DocNode {
  version: 1;
  type: 'doc';
  /**
   * @allowUnsupportedBlock true
   */
  content: Array<
    | BlockContent
    | LayoutSection
    | CodeBlockWithMarks
    | ExpandWithBreakout
    | ParagraphWithIndentationDefinition
  >;
}

export const doc: NodeSpec = {
  // content: '(block|layoutSection)+',
  content: 'block+',
  // marks: 'alignment breakout dataConsumer indentation link unsupportedMark unsupportedNodeAttribute',
};
