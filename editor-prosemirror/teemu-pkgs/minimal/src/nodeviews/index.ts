import { type Node } from 'prosemirror-model';
import { type EditorView, Decoration } from 'prosemirror-view';

import { BlockQuoteView } from './BlockQuoteView';

export const nodeViews = {
  blockquote: (node: Node, view: EditorView, getPos: () => number) =>
    new BlockQuoteView(node, view, getPos),
};
