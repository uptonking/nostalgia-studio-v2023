import { nanoid } from 'nanoid';
import { Editor, Element, Node, Path, Range, Transforms } from 'slate';

import { createListItemElement } from '../list/utils';
import { createParagraphElement } from '../paragraph/utils';
import { DraggableCollapsibleEditor } from './collapsible-editor';
import type { CollapsibleElement, HashedElement } from './types';

type WithCollapsibleOptions = {
  compareLevels: (
    editor: DraggableCollapsibleEditor,
  ) => (a: Element, b: Element) => number;
};

export const withDraggableCollapsible =
  ({ compareLevels }: WithCollapsibleOptions) =>
  <T extends Editor>(editor: T) => {
    const e = editor as T & DraggableCollapsibleEditor;

    const { insertBreak, deleteBackward } = e;

    e.deleteBackward = (unit) => {
      if (editor.selection) {
        const firstLevelPath = Editor.path(editor, editor.selection, {
          depth: 1,
        });
        const isSelAtFirstLevelElement = Range.includes(
          editor.selection,
          Editor.start(editor, firstLevelPath),
        );

        // console.log(
        //   ';; isSelAtFirstLevelElement ',
        //   isSelAtFirstLevelElement,
        //   JSON.stringify(editor.selection),
        //   Editor.start(editor, firstLevelPath)
        // );

        if (isSelAtFirstLevelElement && Path.hasPrevious(firstLevelPath)) {
          const prevEntry = Editor.previous(editor, { at: firstLevelPath })!;
          const node = prevEntry[0] as Element;
          const { hidden } = DraggableCollapsibleEditor.semanticNode(node);
          const semanticPath = DraggableCollapsibleEditor.semanticPath(node);

          if (hidden) {
            const start = [semanticPath[0].index];
            const end = prevEntry[1];
            const at = Editor.range(editor, start, end);

            Transforms.setNodes<CollapsibleElement & Node>(
              editor,
              { folded: false, foldedCount: 0 },
              {
                at,
                match: (node) =>
                  DraggableCollapsibleEditor.isCollapsibleElement(e, node) &&
                  Boolean(node.folded),
              },
            );

            Transforms.setNodes<HashedElement & Node>(
              editor,
              { hash: nanoid(4) },
              { at },
            );

            deleteBackward(unit);
            return;
          }
        }
      }

      deleteBackward(unit);
    };

    e.insertBreak = () => {
      const [entry] = Editor.nodes(editor, {
        match: (node, path): node is Element & CollapsibleElement =>
          path.length === 1 &&
          DraggableCollapsibleEditor.isCollapsibleElement(e, node) &&
          Boolean(node.folded) &&
          Boolean(editor.selection) &&
          Range.includes(editor.selection, Editor.end(editor, path)),
      });

      if (entry) {
        const [node, path] = entry;

        const index = path[0];
        const skipCount = node.foldedCount || 0;
        const at = [index + skipCount + 1];

        const newNode = DraggableCollapsibleEditor.isNestableElement(e, node)
          ? createListItemElement({ depth: node.depth })
          : createParagraphElement();

        Transforms.insertNodes(editor, newNode, {
          at,
        });
        Transforms.select(editor, Editor.end(editor, at));
        return;
      }

      insertBreak();
    };

    e.compareLevels = compareLevels(e);

    e.isCollapsibleElement = () => false;

    e.isNestableElement = (element) =>
      Boolean(
        element &&
          element['depth'] &&
          typeof element['depth'] === 'number' &&
          element['depth'] > 0,
      );

    return e;
  };
