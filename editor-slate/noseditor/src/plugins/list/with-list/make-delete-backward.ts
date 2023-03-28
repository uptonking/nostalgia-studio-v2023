import { BaseEditor, Editor, Node, Path, Range, Transforms } from 'slate';

import { ParagraphSpec } from '../../paragraph/utils';
import { moveItemsBack } from '../commands';
import { isListItemElement } from '../utils';

const makeDeleteBackward = (editor: Editor): BaseEditor['deleteBackward'] => {
  const { deleteBackward } = editor;

  return (unit) => {
    if (editor.selection) {
      const path = Editor.path(editor, editor.selection, { depth: 1 });
      const [node] = Editor.node(editor, path);
      const atStart = Range.includes(
        editor.selection,
        Editor.start(editor, path),
      );

      const isListItem = isListItemElement(node);
      const previousEntry = Editor.previous(editor, { at: path })!;
      const isPrevListItem =
        Path.hasPrevious(path) && isListItemElement(previousEntry[0]);

      if (atStart) {
        if (isListItem && !isPrevListItem) {
          if (node.depth === 0) {
            Transforms.setNodes(
              editor,
              {
                type: ParagraphSpec,
              },
              {
                at: path,
              },
            );
          } else {
            moveItemsBack(editor, node, path);
          }
          return;
        }
      }
    }

    deleteBackward(unit);
  };
};

export default makeDeleteBackward;
