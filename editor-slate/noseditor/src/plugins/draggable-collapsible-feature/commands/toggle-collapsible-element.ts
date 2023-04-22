import { Editor, Element, Node, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import { DraggableCollapsibleEditor } from '../collapsible-editor';
import type { CollapsibleElement, SemanticNode } from '../types';
import { updateHash } from './update-hash';

/**
 * collapse element and its children
 */
export const toggleCollapsibleElement = (
  editor: DraggableCollapsibleEditor & ReactEditor,
  element: Element,
) => {
  const path = ReactEditor.findPath(editor, element);
  const semanticDescendants =
    DraggableCollapsibleEditor.semanticDescendants(element);

  if (DraggableCollapsibleEditor.isCollapsibleElement(editor, element)) {
    Editor.withoutNormalizing(editor, () => {
      const index = path[0];

      if (!ReactEditor.isFocused(editor)) {
        // focus and select to change editor state to editable
        ReactEditor.focus(editor);
        Transforms.select(editor, Editor.end(editor, [index]));
      }

      if (!element.folded) {
        const lastDescendantIndex =
          semanticDescendants[semanticDescendants.length - 1]?.index ?? index;

        const isCollapsedChildrenSelected =
          !editor.selection ||
          Range.includes(
            Editor.range(editor, [index], [lastDescendantIndex]),
            editor.selection,
          );
        if (isCollapsedChildrenSelected) {
          // select folded parent content if selection is inside its children
          Transforms.select(editor, Editor.end(editor, [index]));
        }
      }

      Transforms.setNodes<CollapsibleElement & Node>(
        editor,
        element.folded
          ? { folded: false, foldedCount: 0 }
          : {
            folded: true,
            foldedCount: semanticDescendants.length,
          },
        {
          at: path,
          match: (node) => node === element,
        },
      );

      for (const semanticNode of semanticDescendants) {
        updateHash(editor, semanticNode);

        if (!element.folded) {
          updateCollapsedCount(editor, semanticNode);
        }
      }
    });
  }
};

const updateCollapsedCount = (
  editor: DraggableCollapsibleEditor,
  semanticNode: SemanticNode,
) => {
  const { element, index } = semanticNode;

  const semanticDescendants =
    DraggableCollapsibleEditor.semanticDescendants(element);

  if (
    DraggableCollapsibleEditor.isCollapsibleElement(editor, element) &&
    element.folded
  ) {
    Transforms.setNodes<CollapsibleElement & Node>(
      editor,
      { foldedCount: semanticDescendants.length },
      {
        at: [index],
        match: (node) => node === element,
      },
    );
  }
};
