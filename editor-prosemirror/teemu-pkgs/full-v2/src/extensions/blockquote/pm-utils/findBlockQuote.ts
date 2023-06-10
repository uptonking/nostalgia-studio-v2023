import { type EditorState, type Selection } from 'prosemirror-state';

import {
  findParentNodeOfType,
  findSelectedNodeOfType,
} from '@example/prosemirror-utils';

export function findBlockQuote(
  state: EditorState,
  selection?: Selection | null,
) {
  const { blockquote } = state.schema.nodes;
  return (
    findSelectedNodeOfType(blockquote)(selection || state.selection) ||
    findParentNodeOfType(blockquote)(selection || state.selection)
  );
}
