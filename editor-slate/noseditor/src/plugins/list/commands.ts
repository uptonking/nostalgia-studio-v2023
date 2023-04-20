import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import { findSelectionAnchorElement } from '../../utils/queries';
import type {
  CollapsibleElement,
  DraggableCollapsibleEditor,
  NestableElement,
} from '../draggable-collapsible-feature';
import { ParagraphElement } from '../paragraph/types';
import { isParagraphElement, ParagraphSpec } from '../paragraph/utils';
import type { ListItemElement } from './types';
import { isListItemElement, ListItemSpec, ListVariantsType } from './utils';

export const moveItemsForward = (
  editor: DraggableCollapsibleEditor,
  node: NestableElement,
  path: Path,
  maxDepth: number,
) => {
  Transforms.setNodes<NestableElement & Node>(
    editor,
    { depth: Math.min(maxDepth, node.depth + 1) },
    { at: path },
  );
};

export const moveItemsBack = (
  editor: Editor,
  node: NestableElement,
  path: Path,
) => {
  Transforms.setNodes<NestableElement & Node>(
    editor,
    { depth: Math.max(0, node.depth - 1) },
    { at: path },
  );
};

export const checkItem = (
  editor: ReactEditor,
  element: Element,
  checked: boolean,
) => {
  const path = ReactEditor.findPath(editor, element);

  Transforms.setNodes<ListItemElement>(
    editor,
    { checked },
    { match: (node) => node === element, at: path },
  );
};

export const isListBlockActive = (editor: Editor, listType: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      isListItemElement(n) &&
      n.type === ListItemSpec &&
      n['listType'] === listType,
  });

  return Boolean(match);
};

export const toggleList = (
  editor: Editor,
  { listType }: { listType: ListVariantsType },
) => {
  Editor.withoutNormalizing(editor, () => {
    const { selection } = editor;

    if (!selection) {
      return;
    }

    const isActive = isListBlockActive(editor, listType);
    // console.log(';; isActive', listType, isActive)

    if (isActive) {
      Transforms.unsetNodes(editor, 'listType');
      Transforms.setNodes<ParagraphElement>(editor, { type: ParagraphSpec });
    } else {
      // change list type to args' listType
      Transforms.setNodes(
        editor,
        { type: ListItemSpec, listType },
        {
          match: isListItemElement,
        },
      );

      // todo find all ranges
      const currElem = findSelectionAnchorElement(editor) as ListItemElement;

      // change paragraph or non-list to list
      Transforms.setNodes<ListItemElement>(
        editor,
        { type: ListItemSpec, depth: currElem?.depth ?? 0, listType },
        {
          match: (node, path) =>
            Range.isExpanded(selection)
              ? isParagraphElement(node)
              : !isListItemElement(node) && path.length === 1,
        },
      );
    }
  });
};
