import { BaseEditor, Editor, Transforms } from 'slate';

import { isEmptyNode } from '../../../queries';
import { ParagraphSpec } from '../../paragraph/utils';
import { moveItemsBack } from '../transforms';
import { isListItemElement } from '../utils';

const makeInsertBreak = (editor: Editor): BaseEditor['insertBreak'] => {
  const { insertBreak } = editor;

  return () => {
    const [entry] = Editor.nodes(editor, {
      match: isListItemElement,
      mode: 'lowest',
    });

    if (entry) {
      const [node] = entry;

      if (isEmptyNode(node)) {
        if (node.depth > 0) {
          moveItemsBack(editor, entry[0], entry[1]);
          return;
        } else {
          // turn list item into paragraph if it is empty
          Transforms.setNodes(editor, { type: ParagraphSpec });
          // Transforms.unwrapNodes(editor, { match: isListItemElement });
          return;
        }
      }
    }

    insertBreak();
  };
};

export default makeInsertBreak;
