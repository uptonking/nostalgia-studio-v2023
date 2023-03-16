import { Editor, Range, Transforms } from 'slate';

import { isHeadingElement } from '../heading/utils';
import { ParagraphType } from '../paragraph/types';

export const withResetType = (editor: Editor) => {
  const { insertBreak } = editor;

  /**
   * Reset type to paragraph if inserting break from heading element
   */
  editor.insertBreak = () => {
    const [headerEntry] = Editor.nodes(editor, {
      match: (node, path) =>
        isHeadingElement(node) &&
        !!editor.selection &&
        Range.includes(editor.selection, Editor.end(editor, path)),
    });

    if (headerEntry) {
      Transforms.insertNodes(editor, {
        type: ParagraphType,
        children: [
          {
            text: '',
          },
        ],
      });

      return;
    }

    insertBreak();
  };

  return editor;
};
