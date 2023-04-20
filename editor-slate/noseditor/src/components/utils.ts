import { Editor, Element, Node } from 'slate';

import { DraggableCollapsibleEditor } from '../plugins/draggable-collapsible-feature/collapsible-editor';
import {
  isHeading1Element,
  isHeading2Element,
  isHeading3Element,
} from '../plugins/heading/utils';
import { isParagraphElement } from '../plugins/paragraph/utils';

const getSemanticLevel = (editor: Editor, element: Element) => {
  if (
    isParagraphElement(element) &&
    Node.string(element) === '' &&
    editor.children.length > 0 &&
    editor.children[editor.children.length - 1].id === element.id
  ) {
    return 1;
  }

  if (isHeading1Element(element)) {
    return 2;
  }

  if (isHeading2Element(element)) {
    return 3;
  }

  if (isHeading3Element(element)) {
    return 4;
  }

  return Infinity;
};

export const compareLevels =
  (editor: DraggableCollapsibleEditor) => (a: Element, b: Element) => {
    if (
      DraggableCollapsibleEditor.isNestableElement(editor, a) &&
      DraggableCollapsibleEditor.isNestableElement(editor, b)
    ) {
      return Math.sign(a.depth - b.depth);
    }

    return Math.sign(getSemanticLevel(editor, a) - getSemanticLevel(editor, b));
  };
