import { Editor } from 'slate';

import { isListItemElement } from '../utils';
import makeDeleteBackward from './make-delete-backward';
import makeInsertBreak from './make-insert-break';
import makeInsertFragment from './make-insert-fragment';

const withList = (editor: Editor) => {
  editor.insertBreak = makeInsertBreak(editor);
  editor.deleteBackward = makeDeleteBackward(editor);
  editor.insertFragment = makeInsertFragment(editor);

  const { isNestingElement, isFoldingElement } = editor;

  editor.isNestingElement = (element) => {
    return isListItemElement(element) || isNestingElement(element);
  };

  editor.isFoldingElement = (element) => {
    return isListItemElement(element) || isFoldingElement(element);
  };

  return editor;
};

export default withList;
