import { Editor } from 'slate';

import { type DraggableCollapsibleEditor } from '../../draggable-collapsible-feature';
import { isListItemElement } from '../utils';
import { makeDeleteBackward } from './make-delete-backward';
import { makeInsertBreak } from './make-insert-break';
import { makeInsertFragment } from './make-insert-fragment';

export const withList = (editor: DraggableCollapsibleEditor) => {
  editor.insertBreak = makeInsertBreak(editor);
  editor.deleteBackward = makeDeleteBackward(editor);
  editor.insertFragment = makeInsertFragment(editor);

  const { isNestableElement, isCollapsibleElement } = editor;

  editor.isNestableElement = (element) => {
    return isListItemElement(element) || isNestableElement(element);
  };

  editor.isCollapsibleElement = (element) => {
    return isListItemElement(element) || isCollapsibleElement(element);
  };

  return editor;
};
