import { Editor } from 'slate';

import { DraggableCollapsibleEditor } from '../draggable-collapsible-feature';
import { isHeadingElement } from './utils';

export const withHeading = (editor: DraggableCollapsibleEditor) => {
  const { isCollapsibleElement } = editor;

  editor.isCollapsibleElement = (element) => {
    return isHeadingElement(element) || isCollapsibleElement(element);
  };

  return editor;
};
