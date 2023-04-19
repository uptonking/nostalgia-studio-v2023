import { Editor, Range, Transforms } from 'slate';

import { isHeadingElement } from '../heading/utils';
import { ParagraphSpec } from '../paragraph/utils';

export const withResetInsertType = (editor: Editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {

    // /Reset type to paragraph if inserting break from heading element
    const [headerEntry] = Editor.nodes(editor, {
      match: (node, path) =>
        isHeadingElement(node) &&
        Boolean(editor.selection) &&
        Range.includes(editor.selection, Editor.end(editor, path)),
    });
    if (headerEntry) {
      Transforms.insertNodes(editor, {
        type: ParagraphSpec,
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
