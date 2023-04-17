import { nanoid } from 'nanoid';
import { Editor, Element, Path, Range, Transforms } from 'slate';

import { type ListItemElement } from '../plugins/list/types';
import { ListItemSpec, ListVariants } from '../plugins/list/utils';
import { type ParagraphElement } from '../plugins/paragraph/types';
import { ParagraphSpec } from '../plugins/paragraph/utils';
import { ExtendedEditor } from './extended-editor';
import { FoldingElement } from './types';

export const withExtended =
  ({
    compareLevels,
  }: {
    compareLevels: (editor: Editor) => ExtendedEditor['compareLevels'];
  }) =>
  <T extends Editor>(editor: T) => {
    const e = editor as T & ExtendedEditor;

    const { insertBreak, deleteBackward } = e;

    e.deleteBackward = (unit) => {
      if (editor.selection) {
        const path = Editor.path(editor, editor.selection, { depth: 1 });
        const atStart = Range.includes(
          editor.selection,
          Editor.start(editor, path),
        );

        if (atStart && Path.hasPrevious(path)) {
          const prevEntry = Editor.previous(editor, { at: path })!;

          const node = prevEntry[0] as Element;
          const { hidden } = ExtendedEditor.semanticNode(node);
          const semanticPath = ExtendedEditor.semanticPath(node);

          if (hidden) {
            const start = [semanticPath[0].index];
            const end = prevEntry[1];
            const at = Editor.range(editor, start, end);

            Transforms.setNodes(
              editor,
              { folded: false, foldedCount: 0 },
              {
                at,
                match: (node) =>
                  ExtendedEditor.isFoldingElement(editor, node) &&
                  !!node.folded,
              },
            );

            Transforms.setNodes(editor, { hash: nanoid(4) }, { at });

            deleteBackward(unit);
            return;
          }
        }
      }

      deleteBackward(unit);
    };

    e.insertBreak = () => {
      const [entry] = Editor.nodes(editor, {
        match: (node, path): node is Element & FoldingElement =>
          path.length === 1 &&
          ExtendedEditor.isFoldingElement(editor, node) &&
          !!node.folded &&
          !!editor.selection &&
          Range.includes(editor.selection, Editor.end(editor, path)),
      });

      if (entry) {
        const [node, path] = entry;

        const index = path[0];
        const skipCount = node.foldedCount || 0;
        const at = [index + skipCount + 1];

        const newNode = ExtendedEditor.isNestingElement(editor, node)
          ? getEmptyListItem({ depth: node.depth })
          : getEmptyParagraph();

        Transforms.insertNodes(editor, newNode, {
          at,
        });
        Transforms.select(editor, Editor.end(editor, at));
        return;
      }

      insertBreak();
    };

    e.compareLevels = compareLevels(e);
    e.isFoldingElement = () => false;
    e.isNestingElement = (element) =>
      Boolean(
        element &&
          element['depth'] &&
          typeof element['depth'] === 'number' &&
          element['depth'] > 0,
      );
    e.hasSemanticChildren = () => false;

    return e;
  };

const getEmptyParagraph = (): ParagraphElement => {
  return {
    type: ParagraphSpec,
    children: [
      {
        text: '',
      },
    ],
  };
};

const getEmptyListItem = (
  listItem: Partial<ListItemElement>,
): ListItemElement => {
  return {
    type: ListItemSpec,
    children: [
      {
        text: '',
      },
    ],
    listType: listItem.listType ?? ListVariants.Bulleted,
    checked: false,
    depth: listItem.depth ?? 0,
  };
};
